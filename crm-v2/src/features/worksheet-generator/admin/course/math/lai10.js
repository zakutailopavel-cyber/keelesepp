// Matemaatika lai, 10. klass (owner 2026-11-17: the lai courses for grades 10–11). Gümnaasiumi laia matemaatika kursused
// I–V (GRÕK lisa 5 p 2.3.2; okmv course pages; paigutus 10. klassi on meie otsus, vt docs/CURRICULUM_MATEMAATIKA_1_12.md):
// I „Avaldised ja arvuhulgad”, II „Võrrandid ja võrrandisüsteemid”, III „Võrratused. Trigonomeetria I”,
// IV „Trigonomeetria II”, V „Vektor tasandil. Joone võrrand”. Built step by step from the basics and deeper than kitsas
// (proofs, parameters, derivations of the trig formulas); after every course a „Kordamine ja kontrolltöö” lesson whose
// third sheet is a 25-point test. Every task is our own. General trig equations, arcus functions and the trig graphs are
// course VIII (grade 11, ml11), not here.
// The lesson shape is the one of kitsas10.js (math/sheets.js builds three sheets per lesson), with the lai rule of
// lai12.js: every theory line ends with *valemilehel* (on the lai valemileht) or *pähe* (to memorise), and the Russian
// hint says what the formula sheet holds (docs/MATH_RIIGIEKSAM_LAI.md „Valemileht”).
// Text is Markdown + $…$ formulas (KaTeX); r`…` keeps the backslashes of LaTeX.
// A part: [text, points, answer, solution, rows?] — answer '' means the teacher judges it (a proof, a drawing);
// several right forms are separated by |, several answers by ; (engine/mathExpr.js sameMathAnswer).
// `figure` is a „Geomeetriline joonis” (geofigure) block: a triangle, a circle sector or a polygon in coordinates.
const r = String.raw;

export const LAI_10 = {
  id: 'ml10',
  title: 'Matemaatika lai: 10. klass',
  // the library level (Õppevara → Matemaatika, libraryModel.subjectOfLevel); the sheet's level box shows the short one
  level: '10. klass matemaatika lai',
  sheetLevel: 'Lai 10',
  minutes: 90,
  // the teacher's plan in mathCurriculum.js: a school course lesson, not exam prep; the lai track and formula sheet
  plan: 'course',
  track: 'lai',
  formulaSheetRu: 'лист формул lai (на нём тригонометрия: основные тождества, формулы приведения, суммы, разности и двойного угла)',
  phases: {
    transfer: { label: '3 Kontrollülesanne', slot: 3, subtitle: 'Suurem ülesanne nagu kontrolltöös: kirjuta kogu lahenduskäik.' },
  },
  goal: 'Õpilane teisendab avaldisi, lahendab võrrandeid, võrratusi ja nende süsteeme, tuletab trigonomeetria põhivalemeid, lahendab kolmnurki ning kasutab vektoreid ja joone võrrandeid.',
  lessons: [
    // ───────────── I kursus „Avaldised ja arvuhulgad” ─────────────
    {
      title: 'Hulgad ja hulgatehted',
      ru: 'Множества и операции над ними',
      course: 'I',
      exam: 'Hulkade märkimine on iga riigieksami vastuse keel: lahendihulk, määramispiirkond ja tõenäosuse sündmused kirjutatakse hulkadena.',
      can: 'Õpilane leiab hulkade ühendi, ühisosa ja vahe, tunneb osahulka ja tühja hulka ning loendab elemente Venni diagrammi abil.',
      theory: [
        r`Hulk koosneb elementidest: $a\in A$ ($a$ kuulub hulka $A$), $a\notin A$; tühi hulk $\varnothing$ ei sisalda ühtki elementi — *pähe*`,
        r`Osahulk $A\subset B$: iga $A$ element on ka $B$ element; $n$-elemendilisel hulgal on $2^n$ osahulka — *pähe*`,
        r`Ühend $A\cup B$ (vähemalt ühes hulgas), ühisosa $A\cap B$ (mõlemas), vahe $A\setminus B$ ($A$-s, aga mitte $B$-s) — *pähe*`,
        r`Elementide arv: $n(A\cup B)=n(A)+n(B)-n(A\cap B)$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этой темы нет: обозначения ∈, ⊂, ∪, ∩, \\ учим наизусть.',
        'Объединение ∪ — всё вместе; пересечение ∩ — только общее; разность A \\ B — то, что есть в A, но нет в B.',
        'Число элементов объединения: складываем и вычитаем общую часть, иначе она посчитана дважды.',
      ],
      example: {
        task: r`Klassis on 28 õpilast. Korvpalli trennis käib 17, maleringis 12 ja 5 õpilast ei käi kummaski. Mitu õpilast käib mõlemas?`,
        steps: [
          r`Olgu $K$ korvpallurid ja $M$ maletajad. Vähemalt ühes ringis käib $n(K\cup M)=28-5=23$ õpilast.`,
          r`$n(K\cup M)=n(K)+n(M)-n(K\cap M)$: $\;23=17+12-x$.`,
          r`$x=29-23=6$. Vastus: mõlemas käib 6 õpilast (ainult korvpallis $11$, ainult males $6$).`,
        ],
      },
      practice: [
        { title: r`$A=\{1;2;3;4;5;6\}$, $B=\{4;5;6;7;8\}$ ja $C=\{2;4;8\}$. Kirjuta elemendid semikooloniga.`, parts: [
          [r`$A\cap B$`, 1, '4; 5; 6', r`Ühised elemendid: $\{4;5;6\}$.`, 1],
          [r`$A\setminus B$`, 1, '1; 2; 3', r`$A$ elemendid, mida $B$-s ei ole: $\{1;2;3\}$.`, 1],
          [r`$B\setminus A$`, 1, '7; 8', r`$B$ elemendid, mida $A$-s ei ole: $\{7;8\}$.`, 1],
          [r`$(A\cup B)\cap C$`, 1, '2; 4; 8', r`$A\cup B=\{1;2;\dots;8\}$; ühisosa $C$-ga on $\{2;4;8\}$.`, 1],
        ] },
        { title: r`Osahulgad. $M=\{a;b;c\}$.`, parts: [
          [r`Mitu osahulka on hulgal $M$ (koos $\varnothing$ ja $M$-ga)?`, 1, '8', r`$2^3=8$: $\varnothing$, $\{a\}$, $\{b\}$, $\{c\}$, $\{a;b\}$, $\{a;c\}$, $\{b;c\}$, $M$.`, 1],
          [r`Mitu osahulka on 5-elemendilisel hulgal?`, 1, '32', r`Iga element kas kuulub osahulka või mitte: $2^5=32$.`, 1],
          [r`Kirjuta kõik hulga $M$ kaheelemendilised osahulgad.`, 1, '', r`$\{a;b\}$, $\{a;c\}$, $\{b;c\}$.`, 1],
        ] },
        { title: 'Küsitluses osales 40 õpilast: 25 õpib saksa keelt, 18 prantsuse keelt ja 7 õpib mõlemat keelt.', parts: [
          ['Mitu õpilast õpib vähemalt üht neist keeltest?', 2, '36', r`$n(S\cup P)=25+18-7=36$.`, 2],
          ['Mitu õpilast ei õpi kumbagi keelt?', 1, '4', r`$40-36=4$.`, 1],
          ['Mitu õpilast õpib ainult saksa keelt?', 1, '18', r`$25-7=18$.`, 1],
        ] },
        { title: 'Kas väide kehtib iga hulga korral? Kirjuta jah või ei.', parts: [
          [r`Kui $A\subset B$, siis $A\cap B=A$.`, 1, 'jah', r`Iga $A$ element on ka $B$-s, seega ühisosa on terve $A$.`, 0],
          [r`$A\cup\varnothing=\varnothing$`, 1, 'ei', r`$A\cup\varnothing=A$; nt $\{1\}\cup\varnothing=\{1\}\ne\varnothing$.`, 0],
          [r`$(A\setminus B)\cap B=\varnothing$`, 1, 'jah', r`Hulga $A\setminus B$ elemendid ei kuulu $B$-sse, seega ühist elementi $B$-ga ei ole.`, 0],
          [r`Põhjenda: $A\cup B=B$ parajasti siis, kui $A\subset B$.`, 2, '', r`Kui $A\subset B$, ei lisa $A$ ühendisse uusi elemente: $A\cup B=B$. Vastupidi: kui $A\cup B=B$, siis iga $A$ element on ühendis, s.t $B$-s: $A\subset B$.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: 'Spordiklubis on 60 liiget. Ujumas käib 34 liiget, jõusaalis 29 liiget ja 8 liiget ei käi kummaski.', parts: [
        ['Mitu liiget käib nii ujumas kui ka jõusaalis?', 2, '11', r`Vähemalt ühes: $60-8=52$. $\;52=34+29-x$, $\;x=11$.`, 3],
        ['Mitu liiget käib ainult ujumas?', 1, '23', r`$34-11=23$.`, 1],
        ['Mitu liiget käib täpselt ühes kohas?', 1, '41', r`Ainult ujumas $23$, ainult jõusaalis $29-11=18$: kokku $41$.`, 1],
        ['Kanna kõik neli arvu Venni diagrammile.', 1, '', r`Ühisosas $11$, ainult ujumas $23$, ainult jõusaalis $18$, väljaspool ringe $8$; kontroll: $11+23+18+8=60$.`, 3],
      ] },
      self: ['Leian ühendi, ühisosa ja vahe.', 'Tean, mitu osahulka on n-elemendilisel hulgal.', 'Lahendan loendusülesande valemiga n(A ∪ B).'],
    },
    {
      title: 'Arvuhulgad ja irratsionaalsus',
      ru: 'Числовые множества и иррациональность',
      course: 'I',
      exam: 'Arvuhulkade tundmine on vajalik määramispiirkonna ja täisarvuliste lahendite leidmisel; vastuväiteline tõestus kuulub laia kursuse arutlusülesannetesse.',
      can: 'Õpilane liigitab arvud hulkadesse N, Z, Q, I, R, teisendab perioodilise kümnendmurru harilikuks murruks ja tõestab vastuväiteliselt, et √2 on irratsionaalarv.',
      theory: [
        r`$\mathbb N=\{1;2;3;\dots\}\subset\mathbb Z\subset\mathbb Q\subset\mathbb R$; $\;\mathbb Q=\left\{\frac mn\mid m\in\mathbb Z,\ n\in\mathbb N\right\}$; $\;\mathbb R=\mathbb Q\cup\mathbb I$ — *pähe*`,
        r`Ratsionaalarv on lõplik või lõpmatu perioodiline kümnendmurd; irratsionaalarv on lõpmatu mitteperioodiline kümnendmurd (nt $\sqrt2$, $\pi$) — *pähe*`,
        r`Perioodiline murd: $x=0{,}(27)$; $\;100x-x=27$, $\;x=\dfrac{27}{99}=\dfrac3{11}$ (korrutame $10^k$-ga, $k$ = perioodi pikkus) — *pähe*`,
        r`Vastuväiteline tõestus: eeldame väite vastandit ja jõuame vastuoluni — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этой темы нет: числовые множества и перевод периодической дроби учим наизусть.',
        'Периодическую дробь умножаем на 10ᵏ (k — длина периода) и вычитаем исходное число: период исчезает.',
        'Доказательство от противного: допускаем, что √2 = m/n — несократимая дробь, и приходим к противоречию.',
      ],
      example: {
        task: r`Tõesta, et $\sqrt2$ on irratsionaalarv.`,
        steps: [
          r`Oletame vastupidist: $\sqrt2=\dfrac mn$, kus $m,n\in\mathbb N$ ja murd on taandumatu.`,
          r`Siis $2=\dfrac{m^2}{n^2}$, $\;m^2=2n^2$: $m^2$ on paarisarv, seega ka $m$ on paarisarv, $m=2k$.`,
          r`$4k^2=2n^2$, $\;n^2=2k^2$: ka $n$ on paarisarv.`,
          r`$m$ ja $n$ jaguvad mõlemad $2$-ga, kuid murd pidi olema taandumatu — vastuolu. Seega $\sqrt2\notin\mathbb Q$.`,
        ],
      },
      practice: [
        { title: r`Arvud: $-4$; $\;0$; $\;2{,}5$; $\;\sqrt{16}$; $\;\sqrt5$; $\;0{,}(3)$; $\;\pi-3$; $\;\frac79$.`, parts: [
          ['Kirjuta täisarvud.', 1, '-4; 0; 4|-4; 0; √16', r`$-4$, $0$ ja $\sqrt{16}=4$.`, 1],
          ['Kirjuta irratsionaalarvud.', 1, '√5; π-3|sqrt(5); pi-3', r`$\sqrt5$ ja $\pi-3$; $0{,}(3)=\frac13$ on ratsionaalarv.`, 1],
          [r`Mitu arvu kuulub hulka $\mathbb Q$?`, 1, '6', r`$-4$, $0$, $2{,}5$, $\sqrt{16}$, $0{,}(3)$, $\frac79$ — kuus arvu.`, 1],
        ] },
        { title: 'Kirjuta taandumatu harilik murd.', parts: [
          [r`$0{,}(4)$`, 1, '4/9', r`$10x-x=4$, $\;x=\dfrac49$`, 1],
          [r`$0{,}(36)$`, 1, '4/11', r`$100x-x=36$, $\;x=\dfrac{36}{99}=\dfrac4{11}$`, 1],
          [r`$2{,}1(6)$`, 2, '13/6', r`$10x=21{,}(6)$, $\;100x=216{,}(6)$; $\;90x=195$, $\;x=\dfrac{195}{90}=\dfrac{13}6$`],
        ] },
        { title: 'Kas väide on tõene? Kirjuta jah või ei.', parts: [
          ['Kahe irratsionaalarvu summa on alati irratsionaalarv.', 1, 'ei', r`Vastunäide: $\sqrt2+(-\sqrt2)=0\in\mathbb Q$.`, 0],
          ['Iga täisarv on ratsionaalarv.', 1, 'jah', r`$m=\dfrac m1$.`, 0],
          [r`$\sqrt2\cdot\sqrt8$ on ratsionaalarv.`, 1, 'jah', r`$\sqrt{16}=4$.`, 0],
          ['Too näide kahest irratsionaalarvust, mille jagatis on ratsionaalarv.', 1, '', r`Nt $\dfrac{2\sqrt3}{\sqrt3}=2$.`, 1],
        ] },
        { title: 'Tõestused.', parts: [
          [r`Tõesta, et $\sqrt3$ on irratsionaalarv.`, 3, '', r`Oletame $\sqrt3=\frac mn$ (taandumatu). $m^2=3n^2$, seega $m^2$ ja ka $m$ jagub $3$-ga, $m=3k$. $9k^2=3n^2$, $n^2=3k^2$: ka $n$ jagub $3$-ga — vastuolu taandumatusega.`, 4],
          [r`Tõesta, et $1+\sqrt2$ on irratsionaalarv.`, 2, '', r`Kui $1+\sqrt2=q\in\mathbb Q$, siis $\sqrt2=q-1\in\mathbb Q$ (ratsionaalarvude vahe) — vastuolu. Seega $1+\sqrt2\notin\mathbb Q$.`, 3],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Antud on arv $a=0{,}(81)$.`, parts: [
        [r`Kirjuta $a$ taandumatu hariliku murruna.`, 2, '9/11', r`$100a-a=81$, $\;a=\dfrac{81}{99}=\dfrac9{11}$.`, 2],
        [r`Arvuta $a+0{,}(18)$.`, 1, '1', r`$0{,}(18)=\dfrac{18}{99}=\dfrac2{11}$; $\;\dfrac9{11}+\dfrac2{11}=1$.`, 2],
        [r`Tõesta, et $0{,}(9)=1$.`, 2, '', r`$x=0{,}(9)$, $\;10x=9{,}(9)$; $\;10x-x=9$, $\;9x=9$, $\;x=1$.`, 3],
      ] },
      self: ['Liigitan arvud hulkadesse N, Z, Q, I.', 'Teisendan perioodilise murru harilikuks murruks.', 'Oskan vastuväitelist tõestust.'],
    },
    {
      title: 'Reaalarvude piirkonnad ja absoluutväärtus',
      ru: 'Числовые промежутки и модуль',
      course: 'I',
      exam: 'Iga võrratuse ja määramispiirkonna vastus kirjutatakse vahemikuna; absoluutväärtus on laia eksami võrrandites ja võrratustes.',
      can: 'Õpilane kirjutab ja märgib arvteljel vahemikke, leiab nende ühendi ja ühisosa ning lahendab lihtsamaid absoluutväärtusega võrrandeid ja võrratusi.',
      theory: [
        r`Lõik $[a;b]$: $a\le x\le b$; vahemik $(a;b)$: $a<x<b$; poollõigud $[a;b)$, $(a;b]$; lõpmatud $(-\infty;a)$, $[a;\infty)$ — *pähe*`,
        r`$|a|=a$, kui $a\ge0$; $\;|a|=-a$, kui $a<0$; $\;\sqrt{a^2}=|a|$ — *pähe*`,
        r`$|x-a|$ on punktide $x$ ja $a$ kaugus arvteljel — *pähe*`,
        r`$|x|<r\Leftrightarrow-r<x<r$; $\;|x|>r\Leftrightarrow x<-r$ või $x>r$ ($r>0$) — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этой темы нет: обозначения промежутков и определение модуля учим наизусть.',
        'Скобка ( — конец не входит, [ — входит; у бесконечности скобка всегда круглая.',
        '|x − 3| — это расстояние от x до 3 на числовой оси.',
      ],
      example: {
        task: r`Lahenda võrratus $|2x-3|<5$.`,
        steps: [
          r`$|2x-3|<5\Leftrightarrow-5<2x-3<5$.`,
          r`Liidame igale osale $3$: $-2<2x<8$; jagame $2$-ga: $-1<x<4$.`,
          r`Graafikul on $y=|2x-3|$ sirgest $y=5$ allpool punktide $A$ ja $B$ vahel. Vastus: $(-1;4)$.`,
        ],
        graph: { fns: 'y = abs(2x - 3)\ny = 5', xmin: -3, xmax: 6, ymin: -1, ymax: 8, step: 1, stepY: 1, points: 'A(-1; 5)\nB(4; 5)', caption: 'tumesinine: y = |2x − 3| · roheline: y = 5' },
      },
      practice: [
        { title: r`Vahemikud. $A=[-3;4)$ ja $B=(1;7]$.`, parts: [
          [r`Kirjuta vahemikuna: $-2<x\le5$.`, 1, '(-2;5]', r`Vasak ots ei kuulu (ümarsulg), parem kuulub: $(-2;5]$.`, 1],
          [r`Leia $A\cap B$.`, 1, '(1;4)|1<x<4', r`Mõlemas: $1<x<4$.`, 1],
          [r`Leia $A\cup B$.`, 1, '[-3;7]|-3<=x<=7|-3≤x≤7', r`Kokku: $-3\le x\le7$.`, 1],
          [r`Leia $A\setminus B$.`, 1, '[-3;1]|-3<=x<=1|-3≤x≤1', r`$A$ arvud, mis ei ole $B$-s: $-3\le x\le1$ ($1\notin B$).`, 1],
        ] },
        { title: 'Arvuta täpselt (ilma absoluutväärtuse märgita).', parts: [
          [r`$|3-\sqrt{10}|$`, 1, '√10-3|sqrt(10)-3|0,16', r`$\sqrt{10}>3$, seega $|3-\sqrt{10}|=\sqrt{10}-3$.`, 1],
          [r`$|\sqrt2-1{,}5|+|\sqrt2-1|$`, 2, '0,5|1/2', r`$\sqrt2\approx1{,}41$: $\;(1{,}5-\sqrt2)+(\sqrt2-1)=0{,}5$.`],
          [r`$\sqrt{(1-\sqrt3)^2}$`, 1, '√3-1|sqrt(3)-1|0,73', r`$\sqrt{a^2}=|a|$: $\;|1-\sqrt3|=\sqrt3-1$.`, 1],
        ] },
        { title: 'Lahenda.', parts: [
          [r`$|x+2|=7$`, 1, '5; -9', r`$x+2=7$ või $x+2=-7$: $x=5$ või $x=-9$.`, 1],
          [r`$|x-1|\ge3$`, 2, '(-∞;-2]∪[4;∞)|x<=-2; x>=4|x≤-2; x≥4', r`$x-1\ge3$ või $x-1\le-3$: $x\ge4$ või $x\le-2$.`],
          [r`$|3x-6|\le9$`, 2, '[-1;5]|-1<=x<=5|-1≤x≤5', r`$-9\le3x-6\le9$, $\;-3\le3x\le15$, $\;-1\le x\le5$.`],
        ] },
        { title: 'Lihtsusta avaldis $|x-1|+|x-3|$.', parts: [
          [r`kui $1<x<3$`, 2, '2', r`$x-1>0$, $x-3<0$: $(x-1)+(3-x)=2$.`],
          [r`kui $x<1$`, 2, '4-2x', r`Mõlemad avaldised on negatiivsed: $(1-x)+(3-x)=4-2x$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on hulgad $A=\{x\in\mathbb R\mid |x-2|\le3\}$ ja $B=\{x\in\mathbb R\mid |x+1|>2\}$.`, parts: [
        [r`Kirjuta $A$ lõiguna.`, 2, '[-1;5]|-1<=x<=5|-1≤x≤5', r`$-3\le x-2\le3$, $\;-1\le x\le5$.`, 2],
        [r`Kirjuta $B$ vahemike ühendina.`, 2, '(-∞;-3)∪(1;∞)|x<-3; x>1', r`$x+1>2$ või $x+1<-2$: $x>1$ või $x<-3$.`, 2],
        [r`Leia $A\cap B$.`, 2, '(1;5]|1<x<=5|1<x≤5', r`$[-1;5]$ ja $(1;\infty)$ ühine osa on $(1;5]$; vahemikuga $(-\infty;-3)$ ühist osa ei ole.`, 2],
        [r`Mitu täisarvu on hulgas $A\cap B$?`, 1, '4', r`$2;3;4;5$ — neli täisarvu.`, 1],
        [r`Leia $A\setminus B$.`, 1, '[-1;1]|-1<=x<=1|-1≤x≤1', r`$A$ arvud, mis ei kuulu $B$-sse: $-1\le x\le1$.`, 1],
        [r`Märgi hulgad $A$ ja $B$ arvteljel.`, 2, '', r`$A$: täidetud ringid kohal $-1$ ja $5$, nende vahel joon. $B$: tühjad ringid kohal $-3$ ja $1$, kiired vasakule ja paremale.`, 2],
      ] },
      self: ['Kirjutan vahemiku sulgudega õigesti.', 'Leian vahemike ühendi, ühisosa ja vahe.', 'Lahendan |x − a| < r ja |x − a| > r.'],
    },
    {
      title: 'Astmed, standardkuju ja juured',
      ru: 'Степени, стандартный вид и корни',
      course: 'I',
      exam: 'Astmete ja juurte reeglid on laia eksami I osa avaldiseülesandes (5 p); valemilehel neid ei ole.',
      can: 'Õpilane teeb tehteid täisarvulise astendajaga astmetega, kirjutab arvu standardkujul, lihtsustab ruutjuuri ja vabastab nimetaja juurest.',
      theory: [
        r`$a^m\cdot a^n=a^{m+n}$, $\;a^m:a^n=a^{m-n}$, $\;(a^m)^n=a^{mn}$, $\;(ab)^n=a^nb^n$ — *pähe*`,
        r`$a^0=1$, $\;a^{-n}=\dfrac1{a^n}$ ($a\ne0$); standardkuju $a\cdot10^n$, $1\le a<10$ — *pähe*`,
        r`$\sqrt{ab}=\sqrt a\cdot\sqrt b$, $\;\sqrt{\dfrac ab}=\dfrac{\sqrt a}{\sqrt b}$ ($a\ge0$, $b>0$); $\;\sqrt[3]{-8}=-2$ — *pähe*`,
        r`Nimetaja juurest vabaks: $\dfrac{c}{\sqrt a}=\dfrac{c\sqrt a}{a}$, $\;\dfrac{c}{\sqrt a-b}=\dfrac{c(\sqrt a+b)}{a-b^2}$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет свойств степеней и корней — учим наизусть.',
        'Отрицательная степень — это дробь: 2⁻³ = 1/8. Из-под корня выносим полный квадрат: √72 = √(36·2) = 6√2.',
        'Чтобы избавиться от корня в знаменателе, умножаем на сопряжённое: (√5 − 1)(√5 + 1) = 4.',
      ],
      example: {
        task: r`Arvuta $\dfrac{(2\cdot10^{-3})^2\cdot(5\cdot10^{4})^3}{4\cdot10^{7}}$.`,
        steps: [
          r`$(2\cdot10^{-3})^2=4\cdot10^{-6}$; $\;(5\cdot10^4)^3=125\cdot10^{12}$.`,
          r`Lugeja: $4\cdot125\cdot10^{-6+12}=500\cdot10^6=5\cdot10^8$.`,
          r`$\dfrac{5\cdot10^8}{4\cdot10^7}=1{,}25\cdot10^1=12{,}5$.`,
        ],
      },
      practice: [
        { title: r`Lihtsusta ($a,b,x\ne0$).`, parts: [
          [r`$(a^3b^{-2})^2\cdot a^{-4}b^5$`, 1, 'a^2b|a²b|a^2*b|a^2·b|b*a^2', r`$a^{6-4}b^{-4+5}=a^2b$`, 1],
          [r`$(2x^{-1})^{-3}$`, 1, 'x^3/8|x³/8|0,125x^3', r`$2^{-3}x^{3}=\dfrac{x^3}{8}$`, 1],
          [r`$\dfrac{3^{n+2}-3^n}{8\cdot3^n}$`, 2, '1', r`$\dfrac{3^n(9-1)}{8\cdot3^n}=1$`],
        ] },
        { title: 'Standardkuju.', parts: [
          [r`Kirjuta standardkujul $0{,}000\,072$.`, 1, '7,2·10^-5|7,2*10^-5|7,2·10^(-5)|7,2*10^(-5)', r`$7{,}2\cdot10^{-5}$`, 1],
          [r`$(6\cdot10^{-4})\cdot(3{,}5\cdot10^{9})$`, 1, '2,1·10^6|2,1*10^6', r`$21\cdot10^{5}=2{,}1\cdot10^6$`, 1],
          [r`$(9\cdot10^{5}):(1{,}8\cdot10^{-3})$`, 1, '5·10^8|5*10^8', r`$5\cdot10^{5-(-3)}=5\cdot10^8$`, 1],
          [r`Maa mass on $5{,}97\cdot10^{24}$ kg ja Kuu mass $7{,}35\cdot10^{22}$ kg. Mitu korda on Maa raskem (kahe kümnendkohani)?`, 1, '81,22', r`$\dfrac{5{,}97}{7{,}35}\cdot10^{2}\approx81{,}22$`, 1],
        ] },
        { title: 'Lihtsusta.', parts: [
          [r`$\sqrt{72}$`, 1, '6√2|6sqrt(2)|6*sqrt(2)', r`$\sqrt{36\cdot2}=6\sqrt2$`, 1],
          [r`$\sqrt{48}-2\sqrt{27}+\sqrt{75}$`, 2, '3√3|3sqrt(3)|3*sqrt(3)', r`$4\sqrt3-6\sqrt3+5\sqrt3=3\sqrt3$`],
          [r`$(\sqrt5-\sqrt2)(\sqrt5+\sqrt2)$`, 1, '3', r`$5-2=3$`, 1],
          [r`$(2\sqrt3-1)^2$`, 2, '13-4√3|13-4sqrt(3)|6,07', r`$12-4\sqrt3+1=13-4\sqrt3$`],
        ] },
        { title: 'Vabasta nimetaja juurest.', parts: [
          [r`$\dfrac{6}{\sqrt3}$`, 1, '2√3|2sqrt(3)|3,46', r`$\dfrac{6\sqrt3}{3}=2\sqrt3$`, 1],
          [r`$\dfrac{4}{\sqrt5-1}$`, 2, '√5+1|sqrt(5)+1|1+√5|3,24', r`$\dfrac{4(\sqrt5+1)}{5-1}=\sqrt5+1$`],
          [r`$\sqrt[3]{54}-\sqrt[3]{16}$`, 1, '∛2|2^(1/3)|1,26', r`$3\sqrt[3]2-2\sqrt[3]2=\sqrt[3]2$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Täiskasvanu veres on $1$ mm³ kohta umbes $5\cdot10^6$ punalible ja verd on umbes $5$ liitrit ($1$ l $=10^6$ mm³). Punalible läbimõõt on umbes $7{,}5\cdot10^{-6}$ m.`, parts: [
        ['Mitu punalible on veres? Kirjuta standardkujul.', 2, '2,5·10^13|2,5*10^13', r`$5\cdot10^6$ mm³ $\cdot5\cdot10^6=25\cdot10^{12}=2{,}5\cdot10^{13}$`, 2],
        ['Kui kõik punalibled ritta panna, kui pikk oleks rida kilomeetrites?', 2, '187500|1,875·10^5|1,875*10^5', r`$2{,}5\cdot10^{13}\cdot7{,}5\cdot10^{-6}=1{,}875\cdot10^8$ m $=1{,}875\cdot10^5$ km`, 2],
        ['Mitu korda ulatuks see rida ümber ekvaatori (40 000 km)? Kahe kümnendkohani.', 1, '4,69', r`$187\,500:40\,000\approx4{,}69$`, 1],
      ] },
      self: ['Kasutan astme reegleid ka negatiivse astendajaga.', 'Kirjutan ja arvutan standardkujul.', 'Lihtsustan juuri ja vabastan nimetaja juurest.'],
    },
    {
      title: 'Ratsionaalarvulise astendajaga aste ja irratsionaalavaldised',
      ru: 'Степень с рациональным показателем и иррациональные выражения',
      course: 'I',
      exam: 'Laia eksami I osa 3. ülesanne (5 p) on sageli irratsionaalavaldise lihtsustamine kuupide vahe või kaaskorrutise abil.',
      can: 'Õpilane teisendab juured astmeteks ja vastupidi, arvutab ratsionaalarvulise astendajaga astmeid ja lihtsustab irratsionaalavaldisi tegurdades.',
      theory: [
        r`$a^{\frac1n}=\sqrt[n]a$, $\;a^{\frac mn}=\sqrt[n]{a^m}$ ($a>0$); astme reeglid kehtivad ka murdastendajaga — *pähe*`,
        r`$\sqrt[n]a\cdot\sqrt[n]b=\sqrt[n]{ab}$, $\;\sqrt[n]{\sqrt[k]a}=\sqrt[nk]a$, $\;a\sqrt a=a^{\frac32}$ — *pähe*`,
        r`$x-y=(\sqrt x-\sqrt y)(\sqrt x+\sqrt y)$ ($x,y\ge0$) — *pähe*`,
        r`$a\sqrt a\pm b\sqrt b=(\sqrt a\pm\sqrt b)(a\mp\sqrt{ab}+b)$ (kuupide summa ja vahe) — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет этих формул: связь корня и степени и формулы суммы и разности кубов учим наизусть.',
        'a√a = (√a)³, поэтому a√a − 8 = (√a)³ − 2³ — разность кубов.',
        'Сокращаем только множители, поэтому сначала раскладываем числитель.',
      ],
      example: {
        task: r`Lihtsusta $\dfrac{a\sqrt a+b\sqrt b}{\sqrt a+\sqrt b}-\sqrt{ab}$, kui $a,b>0$.`,
        steps: [
          r`$a\sqrt a+b\sqrt b=(\sqrt a)^3+(\sqrt b)^3=(\sqrt a+\sqrt b)(a-\sqrt{ab}+b)$.`,
          r`Taandame: $a-\sqrt{ab}+b-\sqrt{ab}=a-2\sqrt{ab}+b$.`,
          r`Vastus: $(\sqrt a-\sqrt b)^2$.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$32^{\frac35}$`, 1, '8', r`$\left(\sqrt[5]{32}\right)^3=2^3=8$`, 1],
          [r`$0{,}001^{-\frac23}$`, 1, '100', r`$(10^{-3})^{-\frac23}=10^{2}=100$`, 1],
          [r`$\left(\dfrac{27}{64}\right)^{-\frac13}$`, 1, '4/3|1,33', r`$\left(\dfrac{64}{27}\right)^{\frac13}=\dfrac43$`, 1],
          [r`$9^{1{,}5}\cdot81^{-0{,}25}$`, 1, '9', r`$27\cdot\dfrac13=9$`, 1],
        ] },
        { title: r`Kirjuta astmena ($a>0$).`, parts: [
          [r`$\sqrt a\cdot\sqrt[3]a$`, 1, 'a^(5/6)', r`$a^{\frac12+\frac13}=a^{\frac56}$`, 1],
          [r`$\sqrt{a\sqrt a}$`, 1, 'a^(3/4)', r`$\left(a^{\frac32}\right)^{\frac12}=a^{\frac34}$`, 1],
          [r`$\dfrac{a^2}{\sqrt[4]{a^3}}$`, 1, 'a^(5/4)', r`$a^{2-\frac34}=a^{\frac54}$`, 1],
        ] },
        { title: r`Lihtsusta ($x,y>0$, $x\ne4$).`, parts: [
          [r`$\dfrac{x-y}{\sqrt x+\sqrt y}$`, 2, '√x-√y|sqrt(x)-sqrt(y)', r`$\dfrac{(\sqrt x-\sqrt y)(\sqrt x+\sqrt y)}{\sqrt x+\sqrt y}=\sqrt x-\sqrt y$`],
          [r`$\dfrac{x-4\sqrt x+4}{\sqrt x-2}$`, 2, '√x-2|sqrt(x)-2', r`$\dfrac{(\sqrt x-2)^2}{\sqrt x-2}=\sqrt x-2$`],
          [r`$x^{\frac12}\left(x^{\frac12}-x^{-\frac12}\right)$`, 1, 'x-1', r`$x^{1}-x^{0}=x-1$`, 1],
        ] },
        { title: 'Arvuta täpselt.', parts: [
          [r`$\dfrac1{\sqrt3-\sqrt2}-\dfrac1{\sqrt3+\sqrt2}$`, 2, '2√2|2sqrt(2)|2,83', r`$\dfrac{(\sqrt3+\sqrt2)-(\sqrt3-\sqrt2)}{3-2}=2\sqrt2$`],
          [r`$\sqrt{7+4\sqrt3}$ (näpunäide: $(2+\sqrt3)^2$)`, 2, '2+√3|2+sqrt(3)|√3+2|3,73', r`$(2+\sqrt3)^2=4+4\sqrt3+3=7+4\sqrt3$, seega $\sqrt{7+4\sqrt3}=2+\sqrt3$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on avaldis $A=\dfrac{a-9}{\sqrt a+3}+\dfrac{a\sqrt a-27}{a+3\sqrt a+9}$, kus $a\ge0$.`, parts: [
        [r`Tegurda $a-9$.`, 1, '(√a-3)(√a+3)|(√a+3)(√a-3)|(sqrt(a)-3)(sqrt(a)+3)', r`$a-9=(\sqrt a)^2-3^2=(\sqrt a-3)(\sqrt a+3)$`, 1],
        [r`Tegurda $a\sqrt a-27$.`, 2, '(√a-3)(a+3√a+9)|(sqrt(a)-3)(a+3sqrt(a)+9)', r`$(\sqrt a)^3-3^3=(\sqrt a-3)(a+3\sqrt a+9)$`, 2],
        [r`Lihtsusta $A$.`, 3, '2√a-6|2sqrt(a)-6|2(√a-3)', r`$A=(\sqrt a-3)+(\sqrt a-3)=2\sqrt a-6$`, 3],
        [r`Arvuta $A$, kui $a=16$.`, 1, '2', r`$2\cdot4-6=2$`, 1],
        [r`Leia $a$, mille korral $A=4$.`, 2, '25', r`$2\sqrt a-6=4$, $\;\sqrt a=5$, $\;a=25$.`, 2],
        [r`Mis $a$ väärtuste korral on $A<0$?`, 1, '[0;9)|0<=a<9|0≤a<9', r`$\sqrt a<3$ ja $a\ge0$: $0\le a<9$.`, 1],
      ] },
      self: ['Teisendan juure astmeks ja vastupidi.', 'Tegurdan ruutude ja kuupide vahe juurte abil.', 'Lihtsustan irratsionaalavaldise.'],
    },
    {
      title: 'Ratsionaalavaldiste teisendamine',
      ru: 'Преобразование рациональных выражений',
      course: 'I',
      exam: 'Laia eksami I osa 3. ülesanne (5 p): lihtsusta ratsionaalavaldis ja arvuta selle väärtus; tegurdamine on vajalik ka võrrandites ja tuletise ülesannetes.',
      can: 'Õpilane tegurdab abivalemite ja ruutkolmliikme abil, taandab, liidab, korrutab ja jagab algebralisi murde ning leiab määramispiirkonna.',
      theory: [
        r`$(a\pm b)^2=a^2\pm2ab+b^2$, $\;a^2-b^2=(a-b)(a+b)$ — *pähe*`,
        r`$(a\pm b)^3=a^3\pm3a^2b+3ab^2\pm b^3$, $\;a^3\pm b^3=(a\pm b)(a^2\mp ab+b^2)$ — *pähe*`,
        r`$ax^2+bx+c=a(x-x_1)(x-x_2)$, kus $x_1$ ja $x_2$ on ruutvõrrandi lahendid — *pähe*`,
        r`Murdu taandatakse ainult teguriga; avaldis on määratud, kui ükski nimetaja ei ole $0$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет формул сокращённого умножения — учим наизусть, включая сумму и разность кубов.',
        'Квадратный трёхчлен раскладываем через корни: 3x² − 5x − 2 = 3(x − 2)(x + 1/3) = (x − 2)(3x + 1).',
        'Сначала раскладываем на множители, потом сокращаем. Деление заменяем умножением на обратную дробь.',
      ],
      example: {
        task: r`Lihtsusta $\left(\dfrac{x}{x-2}-\dfrac{4}{x^2-2x}\right):\dfrac{x^2+4x+4}{3x}$.`,
        steps: [
          r`Määramispiirkond: $x\ne0$, $x\ne2$, $x\ne-2$.`,
          r`Sulgudes: $\dfrac{x\cdot x-4}{x(x-2)}=\dfrac{(x-2)(x+2)}{x(x-2)}=\dfrac{x+2}{x}$.`,
          r`Jagamine: $\dfrac{x+2}{x}\cdot\dfrac{3x}{(x+2)^2}=\dfrac{3}{x+2}$.`,
        ],
      },
      practice: [
        { title: 'Tegurda.', parts: [
          [r`$8x^3-27$`, 1, '(2x-3)(4x^2+6x+9)|(2x-3)(4x²+6x+9)', r`$(2x)^3-3^3=(2x-3)(4x^2+6x+9)$`, 1],
          [r`$x^3+64$`, 1, '(x+4)(x^2-4x+16)|(x+4)(x²-4x+16)', r`$(x+4)(x^2-4x+16)$`, 1],
          [r`$3x^2-5x-2$`, 1, '(x-2)(3x+1)|(3x+1)(x-2)', r`$D=25+24=49$, $x_1=2$, $x_2=-\frac13$: $3(x-2)\left(x+\frac13\right)=(x-2)(3x+1)$`, 1],
          [r`$x^4-16$`, 1, '(x-2)(x+2)(x^2+4)|(x^2+4)(x-2)(x+2)|(x-2)(x+2)(x²+4)', r`$(x^2-4)(x^2+4)=(x-2)(x+2)(x^2+4)$`, 1],
        ] },
        { title: 'Taanda.', parts: [
          [r`$\dfrac{x^2-9}{x^2+6x+9}$`, 1, '(x-3)/(x+3)', r`$\dfrac{(x-3)(x+3)}{(x+3)^2}=\dfrac{x-3}{x+3}$`, 1],
          [r`$\dfrac{2x^2+x-6}{x^2-4}$`, 2, '(2x-3)/(x-2)', r`$2x^2+x-6=(2x-3)(x+2)$; $\;\dfrac{(2x-3)(x+2)}{(x-2)(x+2)}=\dfrac{2x-3}{x-2}$`],
          [r`$\dfrac{a^3-8}{a^2-4}$`, 2, '(a^2+2a+4)/(a+2)|(a²+2a+4)/(a+2)', r`$\dfrac{(a-2)(a^2+2a+4)}{(a-2)(a+2)}=\dfrac{a^2+2a+4}{a+2}$`],
        ] },
        { title: 'Lihtsusta.', parts: [
          [r`$\dfrac3{x-1}-\dfrac2{x+1}$`, 2, '(x+5)/(x^2-1)|(x+5)/(x²-1)|(x+5)/((x-1)(x+1))', r`$\dfrac{3(x+1)-2(x-1)}{(x-1)(x+1)}=\dfrac{x+5}{x^2-1}$`],
          [r`$\dfrac1{x-2}-\dfrac4{x^2-4}$`, 2, '1/(x+2)', r`$\dfrac{x+2-4}{(x-2)(x+2)}=\dfrac{x-2}{(x-2)(x+2)}=\dfrac1{x+2}$`],
        ] },
        { title: 'Samasus.', parts: [
          [r`Tõesta samasus $(a+b)^3-(a-b)^3=2b(3a^2+b^2)$.`, 2, '', r`$(a^3+3a^2b+3ab^2+b^3)-(a^3-3a^2b+3ab^2-b^3)=6a^2b+2b^3=2b(3a^2+b^2)$`, 3],
          [r`Arvuta selle samasuse abil $1001^3-999^3$.`, 2, '6000002', r`$a=1000$, $b=1$: $2\cdot(3\cdot10^6+1)=6\,000\,002$`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on avaldis $B=\left(\dfrac{a+2}{a-2}-\dfrac{a-2}{a+2}\right):\dfrac{4a}{a^2-4}$.`, parts: [
        [r`Leia $a$ väärtused, mille korral avaldis $B$ ei ole määratud.`, 2, '2; -2; 0', r`Nimetajad $a-2$, $a+2$ ja jagaja $\dfrac{4a}{a^2-4}$ ei tohi olla $0$: $a\ne2$, $a\ne-2$, $a\ne0$.`, 2],
        ['Lihtsusta sulgudes olev vahe.', 3, '8a/(a^2-4)|8a/(a²-4)', r`$\dfrac{(a+2)^2-(a-2)^2}{a^2-4}=\dfrac{8a}{a^2-4}$`, 3],
        [r`Näita, et $B$ ei sõltu $a$ väärtusest, ja leia $B$.`, 3, '2', r`$\dfrac{8a}{a^2-4}\cdot\dfrac{a^2-4}{4a}=2$`, 2],
        [r`Lihtsusta $C=\dfrac{x^3-1}{x^2+x+1}-x$.`, 2, '-1', r`$\dfrac{(x-1)(x^2+x+1)}{x^2+x+1}-x=x-1-x=-1$ ($x^2+x+1>0$ alati).`, 2],
      ] },
      self: ['Tegurdan abivalemitega ja ruutkolmliiget.', 'Leian, millal avaldis ei ole määratud.', 'Lihtsustan murdude summa, korrutise ja jagatise.'],
    },
    {
      title: 'Protsentülesanded',
      ru: 'Задачи на проценты',
      course: 'I',
      exam: 'Protsent ja liitprotsent on laia eksami tekst- ja mudeliülesannetes (nt hinnamuutus, intress, rahvaarvu kahanemine).',
      can: 'Õpilane arvutab osa ja terviku, protsentuaalse muutuse ja järjestikused muutused ning eristab protsenti ja protsendipunkti.',
      theory: [
        r`$p\%$ arvust $a$ on $a\cdot\dfrac p{100}$; muutus protsentides $=\dfrac{\text{uus}-\text{vana}}{\text{vana}}\cdot100\%$ — *pähe*`,
        r`Suurenemine $p\%$: $a\left(1+\dfrac p{100}\right)$; vähenemine: $a\left(1-\dfrac p{100}\right)$ — *pähe*`,
        r`Järjestikused muutused korrutatakse; $n$ korda $p\%$: $a\left(1+\dfrac p{100}\right)^n$ (liitprotsent) — *pähe*`,
        r`Protsendipunkt on kahe protsendi vahe: $20\%\to25\%$ on $+5$ protsendipunkti, kuid $+25\%$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет формул процентов — учим наизусть.',
        'Несколько изменений подряд — перемножаем множители: +10 %, затем −10 % дают 1,1 · 0,9 = 0,99, то есть −1 %.',
        'Процентный пункт — разность процентов, это не то же самое, что процент.',
      ],
      example: {
        task: r`Hoiusele pannakse $2000$ € aastaintressiga $4\%$ (intress lisatakse igal aastal hoiusele). Kui suur on summa $5$ aasta pärast? Mitme aasta pärast on summa esimest korda vähemalt kahekordne?`,
        steps: [
          r`Igal aastal korrutub summa $1{,}04$-ga: $S_n=2000\cdot1{,}04^n$.`,
          r`$S_5=2000\cdot1{,}04^5\approx2433{,}31$ €.`,
          r`$1{,}04^{17}\approx1{,}948<2$, $\;1{,}04^{18}\approx2{,}026>2$: summa on kahekordne $18$ aasta pärast (graafikul punkt $Q$).`,
        ],
        graph: { fns: 'y = 2000*1.04^x\ny = 4000', xmin: -1, xmax: 21, ymin: -500, ymax: 5000, step: 2, stepY: 500, labelEvery: 1, points: 'P(5; 2433.31)\nQ(18; 4051.63)', caption: 'tumesinine: S = 2000 · 1,04ⁿ · roheline: 4000 €' },
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$15\%$ arvust $240$`, 1, '36', r`$240\cdot0{,}15=36$`, 1],
          [r`Mitu protsenti on $42$ arvust $56$?`, 1, '75', r`$\dfrac{42}{56}\cdot100\%=75\%$`, 1],
          [r`Leia arv, mille $35\%$ on $21$.`, 1, '60', r`$21:0{,}35=60$`, 1],
        ] },
        { title: 'Telefon maksis 480 €. Hind langes 15%, seejärel tõusis uus hind 15%.', parts: [
          ['Hind pärast langust (€)', 1, '408', r`$480\cdot0{,}85=408$`, 1],
          ['Hind pärast tõusu (€)', 1, '469,2', r`$408\cdot1{,}15=469{,}2$`, 1],
          ['Mitu protsenti odavam on lõpphind algsest hinnast?', 2, '2,25', r`$0{,}85\cdot1{,}15=0{,}9775$: hind on $2{,}25\%$ madalam.`],
        ] },
        { title: 'Toote hind koos 24% käibemaksuga on 37,20 €.', parts: [
          ['Hind ilma käibemaksuta (€)', 2, '30', r`$37{,}2:1{,}24=30$`],
          ['Käibemaks tõuseb 25%-le. Mitu protsendipunkti tõusis maksumäär?', 1, '1', r`$25-24=1$ protsendipunkt.`, 1],
          ['Mitu protsenti tõusis maksumäär (kahe kümnendkohani)?', 1, '4,17', r`$\dfrac{1}{24}\cdot100\%\approx4{,}17\%$`, 1],
          ['Toote hind 25% käibemaksuga (€)', 1, '37,5', r`$30\cdot1{,}25=37{,}5$`, 1],
        ] },
        { title: 'Linnas elas 2020. aastal 48 000 inimest. Elanike arv väheneb igal aastal 1,5%.', parts: [
          ['Mitu elanikku on linnas 2025. aastal (täisarvuni)?', 2, '44506', r`$48\,000\cdot0{,}985^5\approx44\,506$`],
          ['Mitu protsenti väheneb elanike arv 10 aastaga (kahe kümnendkohani)?', 2, '14,03', r`$1-0{,}985^{10}\approx0{,}1403$, s.t $14{,}03\%$ (mitte $15\%$).`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Pood ostab jope 60 € eest ja müüb selle 45% juurdehindlusega. Hooaja lõpus antakse müügihinnast 30% allahindlust ja hiljem allahinnatud hinnast veel 20%.', parts: [
        ['Leia jope müügihind (€).', 2, '87', r`$60\cdot1{,}45=87$`, 2],
        ['Leia hind pärast esimest allahindlust (€).', 2, '60,9', r`$87\cdot0{,}7=60{,}9$`, 2],
        ['Leia hind pärast teist allahindlust (€).', 2, '48,72', r`$60{,}9\cdot0{,}8=48{,}72$`, 2],
        ['Mitu protsenti kokku langes hind algsest müügihinnast?', 2, '44', r`$0{,}7\cdot0{,}8=0{,}56$: langus $44\%$ (mitte $50\%$).`, 2],
        ['Mitu protsenti ostuhinnast on poe kahjum, kui jope müüakse lõpphinnaga?', 2, '18,8', r`$\dfrac{48{,}72}{60}=0{,}812$: kahjum $18{,}8\%$ ostuhinnast.`, 2],
      ] },
      self: ['Leian osa, terviku ja protsendi.', 'Korrutan järjestikused muutused kordajatena.', 'Eristan protsenti ja protsendipunkti.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: I kursus',
      ru: 'Повторение и контрольная работа: I курс',
      course: 'I',
      exam: 'Kontrolltöö kordab I kursust samas vormis nagu laia riigieksami I osa: iga õige samm annab punkti.',
      can: 'Õpilane lahendab I kursuse põhiülesandeid iseseisvalt ja kirjutab lahenduskäigu.',
      theory: [
        r`Hulgad: $n(A\cup B)=n(A)+n(B)-n(A\cap B)$; vahemikud $(a;b)$, $[a;b]$; $\;|x-a|<r\Leftrightarrow a-r<x<a+r$ — *pähe*`,
        r`Perioodiline murd: korruta $10^k$-ga ja lahuta; vastuväiteline tõestus ($\sqrt2\notin\mathbb Q$) — *pähe*`,
        r`Astmed ja juured: $a^{-n}=\dfrac1{a^n}$, $\;a^{\frac mn}=\sqrt[n]{a^m}$, $\;\sqrt{a^2}=|a|$ — *pähe*`,
        r`Abivalemid: $a^2-b^2$, $(a\pm b)^2$, $a^3\pm b^3$; ruutkolmliige $a(x-x_1)(x-x_2)$ — *pähe*`,
        r`Protsent: kordaja $1\pm\dfrac p{100}$, järjestikused muutused korrutatakse — *pähe*`,
      ],
      ru_hint: [
        'Контрольная: 25 баллов, 45 минут. На листе формул lai нет формул I курса — всё нужно знать наизусть.',
        'Пиши все шаги: балл дают за каждый верный шаг.',
        'Сначала реши задания, в которых уверен, потом возвращайся к трудным.',
      ],
      example: {
        task: r`Lihtsusta $\dfrac{x^2-1}{x^3-1}\cdot\dfrac{x^2+x+1}{x+1}$.`,
        steps: [
          r`$x^2-1=(x-1)(x+1)$, $\;x^3-1=(x-1)(x^2+x+1)$; $x\ne1$, $x\ne-1$.`,
          r`$\dfrac{(x-1)(x+1)(x^2+x+1)}{(x-1)(x^2+x+1)(x+1)}=1$.`,
        ],
      },
      practice: [
        { title: r`$A=\{1;3;5;7;9\}$ ja $B=\{3;6;9\}$.`, parts: [
          [r`$A\cap B$`, 1, '3; 9', r`$\{3;9\}$`, 1],
          [r`$A\setminus B$`, 1, '1; 5; 7', r`$\{1;5;7\}$`, 1],
        ] },
        { title: 'Arvuhulgad ja absoluutväärtus.', parts: [
          [r`Kirjuta $0{,}(12)$ taandumatu murruna.`, 1, '4/33', r`$\dfrac{12}{99}=\dfrac4{33}$`, 1],
          [r`Lahenda $|x-4|<1$.`, 1, '(3;5)|3<x<5', r`$-1<x-4<1$, $\;3<x<5$.`, 1],
        ] },
        { title: 'Arvuta.', parts: [
          [r`$8^{\frac23}\cdot4^{-\frac12}$`, 1, '2', r`$4\cdot\dfrac12=2$`, 1],
          [r`$\sqrt{18}+\sqrt{50}$`, 1, '8√2|8sqrt(2)|8*sqrt(2)', r`$3\sqrt2+5\sqrt2=8\sqrt2$`, 1],
        ] },
        { title: 'Tegurda ja arvuta.', parts: [
          [r`Tegurda $x^3-1$.`, 1, '(x-1)(x^2+x+1)|(x-1)(x²+x+1)', r`Kuupide vahe: $(x-1)(x^2+x+1)$.`, 1],
          ['Hind tõusis 20% ja langes siis 25%. Mitu protsenti on lõpphind algsest madalam?', 1, '10', r`$1{,}2\cdot0{,}75=0{,}9$: $10\%$ madalam.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'I kursus: hulgad, arvuhulgad, astmed ja juured, avaldised, protsent. Aega 45 minutit.', parts: [
        [r`1. $A=[-2;5)$ ja $B=(1;8]$. Leia $A\cap B$.`, 1, '(1;5)|1<x<5', r`Ühine osa: $1<x<5$.`, 1],
        [r`2. Leia $A\cup B$ (hulgad 1. ülesandest).`, 1, '[-2;8]|-2<=x<=8|-2≤x≤8', r`Kokku: $-2\le x\le8$.`, 1],
        [r`3. Lahenda $|2x+1|\le7$.`, 2, '[-4;3]|-4<=x<=3|-4≤x≤3', r`$-7\le2x+1\le7$, $\;-8\le2x\le6$, $\;-4\le x\le3$.`, 2],
        [r`4. Kirjuta $0{,}3(6)$ taandumatu harilikuks murruks.`, 2, '11/30', r`$10x=3{,}(6)$, $\;100x=36{,}(6)$; $\;90x=33$, $\;x=\dfrac{33}{90}=\dfrac{11}{30}$.`, 2],
        [r`5. Tõesta, et $\sqrt5$ on irratsionaalarv.`, 3, '', r`Oletame $\sqrt5=\frac mn$ (taandumatu). $m^2=5n^2$, seega $m$ jagub $5$-ga, $m=5k$; $25k^2=5n^2$, $n^2=5k^2$, ka $n$ jagub $5$-ga — vastuolu.`, 4],
        [r`6. Arvuta $0{,}25^{-\frac32}+27^{\frac23}-\left(\dfrac12\right)^{-3}$.`, 3, '9', r`$4^{\frac32}+9-8=8+9-8=9$`, 3],
        [r`7. Vabasta nimetaja juurest: $\dfrac{6}{\sqrt7-1}$.`, 2, '√7+1|sqrt(7)+1|1+√7|3,65', r`$\dfrac{6(\sqrt7+1)}{7-1}=\sqrt7+1$`, 2],
        [r`8. Lihtsusta $\dfrac{x^2-4x+4}{x^2-4}:\dfrac{x-2}{x^2+2x}$.`, 3, 'x', r`$\dfrac{(x-2)^2}{(x-2)(x+2)}\cdot\dfrac{x(x+2)}{x-2}=x$ ($x\ne0;\pm2$).`, 3],
        [r`9. Lihtsusta $\dfrac{a\sqrt a-8}{\sqrt a-2}-2\sqrt a$ ($a\ge0$, $a\ne4$).`, 3, 'a+4', r`$\dfrac{(\sqrt a-2)(a+2\sqrt a+4)}{\sqrt a-2}-2\sqrt a=a+4$`, 3],
        ['10. Palk tõusis ühel aastal 8% ja järgmisel 5%. Mitu protsenti tõusis palk kahe aastaga?', 2, '13,4', r`$1{,}08\cdot1{,}05=1{,}134$: $13{,}4\%$.`, 2],
        ['11. Mitu protsenti peab palk kolmandal aastal tõusma, et kolme aasta kogutõus oleks 20%? Kahe kümnendkohani.', 3, '5,82', r`$1{,}134\cdot q=1{,}2$, $\;q=\dfrac{1{,}2}{1{,}134}\approx1{,}0582$: $5{,}82\%$.`, 3],
      ] },
      self: ['Oskan I kursuse kõiki ülesandetüüpe.', 'Kirjutan iga sammu.', 'Kontrollin vastused.'],
    },

    // ───────────── II kursus „Võrrandid ja võrrandisüsteemid” ─────────────
    {
      title: 'Võrdus, samasus ja lineaarvõrrand parameetriga',
      ru: 'Равенство, тождество и линейное уравнение с параметром',
      course: 'II',
      exam: 'Samasusteisendused on iga riigieksami ülesande alus; parameetriga võrrand tuleb laia eksami II osas ette (nt mitu lahendit, millal lahend puudub).',
      can: 'Õpilane eristab võrrandit ja samasust, teeb samaväärseid teisendusi ning lahendab lineaarvõrrandi parameetri kõigil väärtustel.',
      theory: [
        r`Samasus on võrdus, mis kehtib muutujate kõigi lubatavate väärtuste korral, nt $(a-b)(a+b)=a^2-b^2$ — *pähe*`,
        r`Samaväärsed võrrandid on sama lahendihulgaga. Samaväärne teisendus: liita mõlemale poolele sama avaldis, korrutada või jagada nullist erineva arvuga — *pähe*`,
        r`$ax=b$: kui $a\ne0$, siis $x=\dfrac ba$; kui $a=0$ ja $b\ne0$, siis lahend puudub; kui $a=0$ ja $b=0$, siis sobib iga $x$ — *pähe*`,
        r`Korrutamine avaldisega, mis võib olla $0$, või ruutu tõstmine võib anda võõrlahendi: lahendid tuleb kontrollida — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этой темы нет: три случая уравнения ax = b учим наизусть.',
        'Тождество верно при всех x, уравнение — только при некоторых.',
        'С параметром: сначала отдельно случай, когда коэффициент при x равен 0.',
      ],
      example: {
        task: r`Lahenda võrrand $(a-2)x=a^2-4$ parameetri $a$ kõigil väärtustel.`,
        steps: [
          r`Paremal pool $a^2-4=(a-2)(a+2)$.`,
          r`Kui $a\ne2$, jagame $a-2$-ga: $x=a+2$.`,
          r`Kui $a=2$, saame $0\cdot x=0$: võrdus kehtib iga $x$ korral.`,
          r`Vastus: $a\ne2$ korral $x=a+2$; $a=2$ korral sobib iga reaalarv.`,
        ],
      },
      practice: [
        { title: 'Kas võrdus on samasus? Kirjuta jah või ei.', parts: [
          [r`$(x+3)^2=x^2+9$`, 1, 'ei', r`$(x+3)^2=x^2+6x+9$; nt $x=1$ korral $16\ne10$.`, 0],
          [r`$(x-2)(x+2)=x^2-4$`, 1, 'jah', r`Ruutude vahe valem kehtib iga $x$ korral.`, 0],
          [r`$(a-b)^2=(b-a)^2$`, 1, 'jah', r`$(b-a)^2=\big(-(a-b)\big)^2=(a-b)^2$.`, 0],
        ] },
        { title: 'Lahenda võrrand. Kui sobib iga arv, kirjuta R; kui lahendit ei ole, kirjuta puudub.', parts: [
          [r`$3(x-2)-2(x+1)=x-8$`, 2, 'R|iga x|x∈R', r`$3x-6-2x-2=x-8$, $\;x-8=x-8$: võrdus kehtib iga $x$ korral (samasus).`, 2],
          [r`$2(x+1)-x=x+5$`, 1, 'puudub|∅', r`$x+2=x+5$, $\;0\cdot x=3$: lahend puudub.`, 2],
          [r`$\dfrac{x-3}{4}-\dfrac{x+1}{6}=1$`, 2, '23', r`Korrutame $12$-ga: $3(x-3)-2(x+1)=12$, $\;x-11=12$, $\;x=23$.`],
        ] },
        { title: r`Võrrand $ax+3=2x+a$ parameetriga $a$.`, parts: [
          [r`Lahenda, kui $a=5$.`, 1, '2/3|0,67', r`$5x+3=2x+5$, $\;3x=2$, $\;x=\dfrac23$.`, 2],
          [r`Mis väärtusel $a$ lahend puudub?`, 2, '2', r`$(a-2)x=a-3$. Kui $a=2$: $0\cdot x=-1$ — lahend puudub.`],
          [r`Mis väärtusel $a$ on lahend $x=0$?`, 1, '3', r`$x=\dfrac{a-3}{a-2}=0$, kui $a=3$.`, 2],
        ] },
        { title: 'Samasus ja selle kasutamine.', parts: [
          [r`Tõesta samasus $(a+b)^2-(a-b)^2=4ab$.`, 2, '', r`$(a^2+2ab+b^2)-(a^2-2ab+b^2)=4ab$. Vasak pool teisenes paremaks iga $a$ ja $b$ korral.`, 3],
          [r`Arvuta selle abil $1001^2-999^2$.`, 1, '4000', r`$a=1000$, $b=1$: $4\cdot1000\cdot1=4000$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on võrrand $(a^2-9)x=a+3$, kus $a$ on parameeter.`, parts: [
        [r`Lahenda võrrand, kui $a=5$.`, 2, '0,5|1/2', r`$16x=8$, $\;x=0{,}5$.`, 2],
        [r`Mis väärtusel $a$ on võrrandil lõpmata palju lahendeid?`, 2, '-3', r`$a=-3$: $0\cdot x=0$ — sobib iga $x$.`, 2],
        [r`Mis väärtusel $a$ lahend puudub?`, 2, '3', r`$a=3$: $0\cdot x=6$ — lahend puudub.`, 2],
        [r`Avalda lahend $x$, kui $a\ne\pm3$.`, 2, '1/(a-3)', r`$x=\dfrac{a+3}{(a-3)(a+3)}=\dfrac{1}{a-3}$.`, 2],
        [r`Mis väärtusel $a$ on lahend $x=0{,}25$?`, 2, '7', r`$\dfrac1{a-3}=\dfrac14$, $\;a-3=4$, $\;a=7$.`, 2],
      ] },
      self: ['Eristan võrrandit ja samasust.', 'Tean võrrandi ax = b kolme juhtu.', 'Lahendan võrrandi parameetri kõigil väärtustel.'],
    },
    {
      title: "Ruutvõrrand, Viète'i teoreem ja parameeter",
      ru: 'Квадратное уравнение, теорема Виета и параметр',
      course: 'II',
      exam: 'Ruutvõrrand on peaaegu igas laia eksami ülesandes (ekstreemum, lõikepunktid, tekstülesanne); parameetriga ruutvõrrand tuleb ette II osas.',
      can: "Õpilane lahendab ruutvõrrandi, kasutab Viète'i teoreemi ja leiab parameetri, mille korral võrrandil on kaks, üks või null lahendit.",
      theory: [
        r`$ax^2+bx+c=0$, $a\ne0$: $\;D=b^2-4ac$, $\;x_{1,2}=\dfrac{-b\pm\sqrt D}{2a}$ — *pähe*`,
        r`$D>0$: kaks lahendit; $\;D=0$: üks lahend $x=-\dfrac b{2a}$; $\;D<0$: reaalarvulisi lahendeid ei ole — *pähe*`,
        r`Viète: $x_1+x_2=-\dfrac ba$, $\;x_1x_2=\dfrac ca$ (taandatud võrrandis $x^2+px+q=0$: $x_1+x_2=-p$, $x_1x_2=q$) — *pähe*`,
        r`$ax^2+bx+c=a(x-x_1)(x-x_2)$; $\;x_1^2+x_2^2=(x_1+x_2)^2-2x_1x_2$ — *pähe*`,
      ],
      ru_hint: [
        'Формулы корней и теорема Виета не на листе формул lai — учим наизусть.',
        'Если при x² стоит параметр, сначала разбери случай, когда он равен 0: тогда уравнение линейное.',
        'Одно решение — дискриминант равен 0.',
      ],
      example: {
        task: r`Mis väärtustel $k$ on võrrandil $x^2-kx+9=0$ täpselt üks lahend? Leia see lahend.`,
        steps: [
          r`Üks lahend, kui $D=k^2-36=0$, s.t $k=6$ või $k=-6$.`,
          r`$k=6$: $x^2-6x+9=(x-3)^2=0$, $x=3$.`,
          r`$k=-6$: $x^2+6x+9=(x+3)^2=0$, $x=-3$.`,
          r`Graafikul puudutavad mõlemad paraboolid $x$-telge ühes punktis.`,
        ],
        graph: { fns: 'y = x^2 - 6x + 9\ny = x^2 + 6x + 9', xmin: -6, xmax: 6, ymin: -2, ymax: 10, step: 1, stepY: 2, points: 'A(3; 0)\nB(-3; 0)', caption: 'tumesinine: k = 6 · roheline: k = −6' },
      },
      practice: [
        { title: 'Lahenda võrrand.', parts: [
          [r`$2x^2-7x+3=0$`, 2, '3; 0,5|3; 1/2', r`$D=49-24=25$, $x=\dfrac{7\pm5}{4}$: $3$ ja $0{,}5$.`],
          [r`$3x^2-12=0$`, 1, '2; -2', r`$x^2=4$, $x=\pm2$.`, 2],
          [r`$5x^2+4x=0$`, 1, '0; -0,8|0; -4/5', r`$x(5x+4)=0$: $x=0$ või $x=-0{,}8$.`, 2],
        ] },
        { title: r`Võrrandi $x^2-5x-14=0$ lahendid on $x_1$ ja $x_2$. Leia lahendamata:`, parts: [
          [r`$x_1+x_2$`, 1, '5', r`$x_1+x_2=-p=5$`, 1],
          [r`$x_1x_2$`, 1, '-14', r`$x_1x_2=q=-14$`, 1],
          [r`$x_1^2+x_2^2$`, 2, '53', r`$(x_1+x_2)^2-2x_1x_2=25+28=53$`],
          [r`$\dfrac1{x_1}+\dfrac1{x_2}$`, 2, '-5/14|-0,36', r`$\dfrac{x_1+x_2}{x_1x_2}=\dfrac{5}{-14}=-\dfrac5{14}$`],
        ] },
        { title: r`Võrrandi $x^2+px+q=0$ lahendid on antud. Leia $p$ ja $q$ (kirjuta $p; q$).`, parts: [
          [r`$x_1=3$, $x_2=-7$`, 2, '4; -21', r`$p=-(3-7)=4$, $q=3\cdot(-7)=-21$.`],
          [r`$x_1=2+\sqrt3$, $x_2=2-\sqrt3$`, 2, '-4; 1', r`Summa $4$, seega $p=-4$; korrutis $4-3=1$, seega $q=1$.`],
        ] },
        { title: r`Võrrand $x^2+2x+m=0$ parameetriga $m$.`, parts: [
          [r`Mis väärtustel $m$ on võrrandil kaks erinevat lahendit?`, 2, 'm<1|(-∞;1)', r`$D=4-4m>0$, s.t $m<1$.`],
          [r`Üks lahend on $3$. Leia $m$.`, 1, '-15', r`$9+6+m=0$, $m=-15$.`, 2],
          [r`Leia samal juhul teine lahend.`, 1, '-5', r`$x_1+x_2=-2$: $x_2=-2-3=-5$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on võrrand $(m-2)x^2-4x+1=0$, kus $m$ on parameeter.`, parts: [
        [r`Lahenda võrrand, kui $m=2$.`, 2, '0,25|1/4', r`$m=2$ korral on võrrand lineaarne: $-4x+1=0$, $x=0{,}25$.`, 2],
        [r`Mis väärtusel $m\ne2$ on võrrandil täpselt üks lahend?`, 2, '6', r`$D=16-4(m-2)=24-4m=0$, $m=6$.`, 2],
        [r`Leia see lahend.`, 1, '0,5|1/2', r`$4x^2-4x+1=(2x-1)^2=0$, $x=0{,}5$.`, 1],
        [r`Mis väärtustel $m$ on võrrandil kaks erinevat lahendit?`, 3, '(-∞;2)∪(2;6)|m<6; m≠2', r`Vaja $m\ne2$ (ruutvõrrand) ja $D=24-4m>0$, s.t $m<6$. Vastus: $m<6$, $m\ne2$.`, 3],
        [r`Lahenda võrrand, kui $m=5$.`, 2, '1; 1/3|1; 0,33', r`$3x^2-4x+1=0$, $D=16-12=4$, $x=\dfrac{4\pm2}{6}$: $1$ ja $\dfrac13$.`, 2],
      ] },
      self: ['Lahendan ruutvõrrandi diskriminandi abil.', "Kasutan Viète'i teoreemi.", 'Leian parameetri, mille korral on üks lahend.'],
    },
    {
      title: 'Murdvõrrandid',
      ru: 'Дробные уравнения',
      course: 'II',
      exam: 'Murdvõrrand tekib laia eksami tekstülesannetes (töö, liikumine) ja funktsiooni uurimisel; võõrlahendi kontroll annab eraldi punkti.',
      can: 'Õpilane leiab murdvõrrandi määramispiirkonna, lahendab võrrandi ühise nimetaja või asenduse abil ning kontrollib võõrlahendeid.',
      theory: [
        r`$\dfrac AB=0\;\Leftrightarrow\;A=0$ ja $B\ne0$ — *pähe*`,
        r`Esmalt määramispiirkond: ükski nimetaja ei tohi olla $0$ — *pähe*`,
        r`Korrutame ühise nimetajaga; lahenditest jätame alles ainult need, mis kuuluvad määramispiirkonda — *pähe*`,
        r`Proportsioon: $\dfrac ab=\dfrac cd\;\Leftrightarrow\;ad=bc$ ($b\ne0$, $d\ne0$) — *pähe*`,
        r`Korduva avaldise asendame uue muutujaga, nt $t=\dfrac{x+1}{x}$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этого нет: правило «дробь равна 0, когда числитель 0, а знаменатель нет» учим наизусть.',
        'Сначала выпиши, каким x быть нельзя, потом умножай на общий знаменатель.',
        'Корень, при котором знаменатель равен 0, — посторонний: его вычёркиваем.',
      ],
      example: {
        task: r`Lahenda võrrand $\dfrac{x}{x-2}-\dfrac{8}{x^2-4}=1$.`,
        steps: [
          r`$x^2-4=(x-2)(x+2)$, seega $x\ne2$ ja $x\ne-2$.`,
          r`Korrutame $(x-2)(x+2)$-ga: $x(x+2)-8=x^2-4$.`,
          r`$x^2+2x-8=x^2-4$, $\;2x=4$, $\;x=2$.`,
          r`$x=2$ ei kuulu määramispiirkonda (võõrlahend). Vastus: lahend puudub.`,
        ],
      },
      practice: [
        { title: 'Lahenda võrrand.', parts: [
          [r`$\dfrac{x^2-9}{x+3}=0$`, 2, '3', r`Lugeja $0$: $x=\pm3$; nimetaja $\ne0$: $x\ne-3$. Vastus $x=3$.`, 2],
          [r`$\dfrac{2x-1}{x+4}=\dfrac32$`, 2, '14', r`$2(2x-1)=3(x+4)$, $\;4x-2=3x+12$, $\;x=14$ ($x\ne-4$).`],
        ] },
        { title: 'Lahenda võrrand.', parts: [
          [r`$\dfrac{3}{x-1}-\dfrac{2}{x+2}=1$`, 3, '√10; -√10|sqrt(10); -sqrt(10)|3,16; -3,16', r`$x\ne1;-2$. $3(x+2)-2(x-1)=(x-1)(x+2)$, $\;x+8=x^2+x-2$, $\;x^2=10$, $\;x=\pm\sqrt{10}\approx\pm3{,}16$.`, 4],
          [r`$\dfrac{x}{x+1}+\dfrac{2}{x-1}=\dfrac{4}{x^2-1}$`, 3, '-2', r`$x\ne\pm1$. $x(x-1)+2(x+1)=4$, $\;x^2+x-2=0$, $x=1$ või $x=-2$. $x=1$ on võõrlahend. Vastus $x=-2$.`, 4],
        ] },
        { title: r`Võrrand $\dfrac{x+1}{x}+\dfrac{x}{x+1}=\dfrac52$. Tähista $t=\dfrac{x+1}{x}$.`, parts: [
          [r`Kirjuta võrrand $t$ abil ja leia $t$.`, 2, '2; 0,5|2; 1/2', r`$t+\dfrac1t=\dfrac52$, $\;2t^2-5t+2=0$, $\;t=2$ või $t=\dfrac12$.`],
          [r`Leia $x$.`, 2, '1; -2', r`$\dfrac{x+1}x=2$: $x=1$. $\;\dfrac{x+1}x=\dfrac12$: $2x+2=x$, $x=-2$. Mõlemad sobivad.`],
        ] },
        { title: 'Paat sõidab jõel 24 km pärivoolu ja kohe 24 km tagasi vastuvoolu, kokku 5 tundi. Jõe voolukiirus on 2 km/h.', parts: [
          [r`Koosta võrrand paadi omakiiruse $v$ leidmiseks.`, 1, '', r`$\dfrac{24}{v+2}+\dfrac{24}{v-2}=5$`, 2],
          ['Leia paadi omakiirus (km/h).', 3, '10', r`$24(v-2)+24(v+2)=5(v^2-4)$, $\;5v^2-48v-20=0$, $\;D=2304+400=2704=52^2$, $\;v=\dfrac{48+52}{10}=10$ (teine lahend $-0{,}4$ ei sobi).`, 4],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Kaks töölist värvivad aia koos 6 tunniga. Esimene tööline üksi värviks aia 5 tundi kiiremini kui teine.', parts: [
        [r`Olgu $x$ tundi aeg, mis kulub teisel töölisel üksi. Koosta võrrand.`, 2, '', r`Tunnis värvivad nad $\dfrac1x$ ja $\dfrac1{x-5}$ aiast, koos $\dfrac16$: $\;\dfrac1x+\dfrac1{x-5}=\dfrac16$.`, 2],
        ['Lahenda võrrand.', 4, '15; 2', r`$6(x-5)+6x=x(x-5)$, $\;x^2-17x+30=0$, $\;D=289-120=169$, $\;x=\dfrac{17\pm13}2$: $15$ ja $2$.`, 4],
        ['Mitu tundi kulub esimesel töölisel üksi?', 2, '10', r`$x=2$ ei sobi ($x-5<0$). Teisel kulub 15 h, esimesel $15-5=10$ h.`, 2],
        ['Mitu protsenti aiast värvib esimene tööline nende 6 tunni jooksul?', 2, '60', r`$6\cdot\dfrac1{10}=0{,}6$, s.t $60\%$.`, 1],
      ] },
      self: ['Leian murdvõrrandi määramispiirkonna.', 'Korrutan ühise nimetajaga ja kontrollin lahendeid.', 'Koostan tekstist murdvõrrandi.'],
    },
    {
      title: 'Juurvõrrandid',
      ru: 'Иррациональные уравнения',
      course: 'II',
      exam: 'Juurvõrrand tuleb laia eksami avaldiste- ja funktsiooniülesannetes; kontrollimata võõrlahend maksab punkti.',
      can: 'Õpilane lahendab lihtsamaid juurvõrrandeid ruutu tõstmise või asenduse abil ja kontrollib lahendid.',
      theory: [
        r`$\sqrt A=B\;\Rightarrow\;A=B^2$; lahend sobib ainult siis, kui $B\ge0$ — *pähe*`,
        r`Ruutu tõstmine ei ole samaväärne teisendus: iga lahend tuleb kontrollida algvõrrandis — *pähe*`,
        r`$(\sqrt a)^2=a$, kui $a\ge0$; $\;\sqrt[3]{A}=B\;\Leftrightarrow\;A=B^3$ (kuupjuur ei anna võõrlahendeid) — *pähe*`,
        r`Kahe juurega võrrandis jäta üks juur ühele poole üksi ja tõsta ruutu kaks korda — *pähe*`,
      ],
      ru_hint: [
        'Этих правил нет на листе формул lai — учим наизусть.',
        'После возведения в квадрат могут появиться посторонние корни: всегда делай проверку.',
        'Корень квадратный не бывает отрицательным: правая часть должна быть ≥ 0.',
      ],
      example: {
        task: r`Lahenda võrrand $\sqrt{x+7}=x+1$.`,
        steps: [
          r`Tõstame ruutu: $x+7=x^2+2x+1$, $\;x^2+x-6=0$, $\;x=2$ või $x=-3$.`,
          r`Kontroll: $x=2$: $\sqrt9=3=2+1$ ✓. $\;x=-3$: $\sqrt4=2$, aga $-3+1=-2$ ✗.`,
          r`Vastus: $x=2$. Graafikul lõikuvad $y=\sqrt{x+7}$ ja $y=x+1$ ainult punktis $P(2;3)$.`,
        ],
        graph: { fns: 'y = sqrt(x + 7)\ny = x + 1', xmin: -7, xmax: 5, ymin: -3, ymax: 5, step: 1, stepY: 1, points: 'P(2; 3)', caption: 'tumesinine: y = √(x + 7) · roheline: y = x + 1' },
      },
      practice: [
        { title: 'Lahenda võrrand.', parts: [
          [r`$\sqrt{2x-1}=3$`, 1, '5', r`$2x-1=9$, $x=5$.`, 2],
          [r`$\sqrt{x^2+9}=5$`, 2, '4; -4', r`$x^2+9=25$, $x=\pm4$; mõlemad sobivad.`, 2],
          [r`$\sqrt[3]{x-2}=-2$`, 1, '-6', r`$x-2=-8$, $x=-6$.`, 1],
        ] },
        { title: 'Lahenda võrrand ja kontrolli lahendeid.', parts: [
          [r`$\sqrt{x+2}=x$`, 2, '2', r`$x+2=x^2$, $x=2$ või $x=-1$. $x=-1$: $\sqrt1=1\ne-1$ ✗. Vastus $2$.`],
          [r`$\sqrt{3x+1}=x-3$`, 3, '8', r`$3x+1=x^2-6x+9$, $\;x^2-9x+8=0$, $x=1$ või $x=8$. $x=1$: parem pool $-2<0$ ✗; $x=8$: $\sqrt{25}=5$ ✓.`, 4],
        ] },
        { title: 'Kaks juurt.', parts: [
          [r`$\sqrt{x+5}-\sqrt x=1$`, 2, '4', r`$\sqrt{x+5}=1+\sqrt x$, $\;x+5=1+2\sqrt x+x$, $\;\sqrt x=2$, $x=4$. Kontroll: $3-2=1$ ✓.`, 4],
          [r`$\sqrt{2x+3}=\sqrt{x+1}+1$`, 3, '-1; 3', r`$2x+3=x+2+2\sqrt{x+1}$, $\;x+1=2\sqrt{x+1}$. $t=\sqrt{x+1}$: $t^2=2t$, $t=0$ või $t=2$, s.t $x=-1$ või $x=3$. Kontroll: $1=0+1$ ✓, $3=2+1$ ✓.`, 4],
        ] },
        { title: r`Pendli võnkeperiood on $T=2\pi\sqrt{\dfrac lg}$, kus $g=9{,}81$ m/s².`, parts: [
          ['Kui pikk on pendel (m, kahe kümnendkohani), mille periood on 2 s?', 2, '0,99', r`$\sqrt{\dfrac l g}=\dfrac{T}{2\pi}=\dfrac1\pi$, $\;l=\dfrac{g}{\pi^2}\approx0{,}99$ m.`],
          ['Mitu korda kasvab periood, kui pendli pikkus kasvab 4 korda?', 1, '2', r`$\sqrt{4l}=2\sqrt l$: periood kasvab 2 korda.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on võrrand $\sqrt{x+a}=x-1$, kus $a$ on parameeter.`, parts: [
        [r`Lahenda võrrand, kui $a=5$.`, 3, '4', r`$x+5=x^2-2x+1$, $\;x^2-3x-4=0$, $x=4$ või $x=-1$. $x=-1$: parem pool $-2<0$ ✗. Vastus $4$.`, 4],
        [r`Mis väärtusel $a$ on võrrandi lahend $x=3$?`, 2, '1', r`$\sqrt{3+a}=2$, $\;3+a=4$, $\;a=1$.`, 2],
        [r`Näita, et iga $a>-1$ korral on võrrandil täpselt üks lahend.`, 3, '', r`Vaja $x\ge1$ ja $x+a=(x-1)^2$, s.t $x^2-3x+1-a=0$, $D=5+4a>0$. Suurem lahend $\dfrac{3+\sqrt{5+4a}}2>1$ sobib alati. Väiksem $\dfrac{3-\sqrt{5+4a}}2\ge1$ ainult siis, kui $\sqrt{5+4a}\le1$, s.t $a\le-1$. Seega $a>-1$ korral sobib täpselt üks lahend.`, 5],
        [r`Lahenda võrrand, kui $a=-1$.`, 2, '1; 2', r`$\sqrt{x-1}=x-1$. $t=\sqrt{x-1}\ge0$: $t=t^2$, $t=0$ või $t=1$, s.t $x=1$ või $x=2$.`, 3],
      ] },
      self: ['Tõstan ruutu ja kontrollin lahendeid.', 'Tean, miks tekib võõrlahend.', 'Lahendan kahe juurega võrrandi.'],
    },
    {
      title: 'Absoluutväärtust sisaldavad võrrandid',
      ru: 'Уравнения с модулем',
      course: 'II',
      exam: 'Absoluutväärtus tuleb laias eksamis ette funktsiooni graafikus ja võrratustes; lahendamine vahemike kaupa on sama võte nagu funktsiooni uurimisel.',
      can: 'Õpilane lahendab absoluutväärtusega võrrandi definitsiooni, kahe juhu või vahemike meetodi abil ning seletab lahendite arvu graafiliselt.',
      theory: [
        r`$|A|=c$, $c>0\;\Leftrightarrow\;A=c$ või $A=-c$; $\;|A|=0\Leftrightarrow A=0$; $\;c<0$ korral lahend puudub — *pähe*`,
        r`$|A|=|B|\;\Leftrightarrow\;A=B$ või $A=-B$ — *pähe*`,
        r`$|A|=B$: lahendame $A=B$ ja $A=-B$, jätame alles lahendid, kus $B\ge0$ — *pähe*`,
        r`Mitu absoluutväärtust: avaldiste nullkohad jagavad arvtelje vahemikeks; igas vahemikus kirjutame mooduli ilma absoluutväärtuse märgita — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет модуля: определение |a| = a при a ≥ 0 и |a| = −a при a < 0 учим наизусть.',
        'Если справа выражение с x, проверь, что оно ≥ 0.',
        'Несколько модулей — разбей ось на промежутки по нулям выражений.',
      ],
      example: {
        task: r`Lahenda võrrand $|x-1|=2x-5$.`,
        steps: [
          r`Tingimus: $2x-5\ge0$, s.t $x\ge2{,}5$.`,
          r`$x-1=2x-5$: $x=4$ — sobib.`,
          r`$x-1=-(2x-5)$: $3x=6$, $x=2$ — ei sobi ($2x-5=-1<0$).`,
          r`Vastus: $x=4$. Graafikud lõikuvad punktis $P(4;3)$.`,
        ],
        graph: { fns: 'y = abs(x - 1)\ny = 2x - 5', xmin: -2, xmax: 6, ymin: -3, ymax: 6, step: 1, stepY: 1, points: 'P(4; 3)', caption: 'tumesinine: y = |x − 1| · roheline: y = 2x − 5' },
      },
      practice: [
        { title: 'Lahenda võrrand. Kui lahendit ei ole, kirjuta puudub.', parts: [
          [r`$|2x+3|=7$`, 1, '2; -5', r`$2x+3=7$: $x=2$; $\;2x+3=-7$: $x=-5$.`, 2],
          [r`$|x^2-5|=4$`, 2, '3; -3; 1; -1', r`$x^2-5=4$: $x=\pm3$; $\;x^2-5=-4$: $x=\pm1$.`],
          [r`$|x-4|=-2$`, 1, 'puudub|∅', 'Absoluutväärtus ei ole kunagi negatiivne.', 1],
        ] },
        { title: r`Lahenda võrrand $|x-3|=|2x+1|$.`, parts: [
          ['Leia kõik lahendid.', 3, '-4; 2/3|-4; 0,67', r`$x-3=2x+1$: $x=-4$. $\;x-3=-(2x+1)$: $3x=2$, $x=\dfrac23$.`, 4],
        ] },
        { title: 'Kaks absoluutväärtust. Kirjuta lahendid või vahemik.', parts: [
          [r`$|x+2|+|x-3|=7$`, 3, '-3; 4', r`$x<-2$: $-2x+1=7$, $x=-3$ ✓. $\;-2\le x<3$: $5=7$ — ei. $\;x\ge3$: $2x-1=7$, $x=4$ ✓.`, 4],
          [r`$|x+2|+|x-3|=5$`, 2, '[-2;3]|-2<=x<=3|-2≤x≤3', r`$-2\le x\le3$ korral on summa $(x+2)+(3-x)=5$ alati; väljaspool on summa $>5$. Lahend: lõik $[-2;3]$.`, 3],
        ] },
        { title: 'Lahendite arv.', parts: [
          [r`Mis väärtusel $a$ on võrrandil $|x-2|=a$ täpselt üks lahend?`, 1, '0', r`$a=0$: $x=2$. $a>0$ korral kaks, $a<0$ korral null lahendit.`, 1],
          [r`Lahenda $|x-2|=3$.`, 1, '5; -1', r`$x-2=\pm3$: $x=5$ või $x=-1$.`, 1],
          [r`Mitu lahendit on võrrandil $|x^2-4|=3$?`, 2, '4', r`$x^2=7$ või $x^2=1$: $x=\pm\sqrt7$, $x=\pm1$ — neli lahendit.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=|x+1|-|x-2|$.`, grid: { xmin: -4, xmax: 5, ymin: -4, ymax: 4, step: 1, stepY: 1, blank: true }, parts: [
        [r`Kirjuta $f(x)$ ilma absoluutväärtuse märgita vahemikes $x<-1$, $-1\le x<2$ ja $x\ge2$.`, 3, '', r`$x<-1$: $-(x+1)+(x-2)=-3$; $\;-1\le x<2$: $(x+1)+(x-2)=2x-1$; $\;x\ge2$: $(x+1)-(x-2)=3$.`, 4],
        ['Joonesta funktsiooni graafik.', 2, '', r`Horisontaalne kiir $y=-3$ kuni $x=-1$, lõik punktist $(-1;-3)$ punktini $(2;3)$, siis kiir $y=3$.`, 0],
        [r`Lahenda võrrand $f(x)=1$.`, 2, '1', r`Ainult keskmises vahemikus: $2x-1=1$, $x=1$.`, 2],
        [r`Mis väärtustel $a$ on võrrandil $f(x)=a$ lõpmata palju lahendeid?`, 3, '3; -3', r`Graafik on horisontaalne ainult $y=-3$ ($x\le-1$) ja $y=3$ ($x\ge2$) korral: $a=3$ või $a=-3$.`, 2],
      ] },
      self: ['Lahendan |A| = c kahe juhuna.', 'Kontrollin tingimust B ≥ 0.', 'Jagan arvtelje vahemikeks nullkohtade järgi.'],
    },
    {
      title: 'Lineaarvõrrandisüsteemid (kuni kolm tundmatut)',
      ru: 'Системы линейных уравнений (до трёх неизвестных)',
      course: 'II',
      exam: 'Laia eksami I osas on tekstülesanne võrrandisüsteemiga (5 p); kolme tundmatuga süsteem tekib nt parabooli kordajate leidmisel.',
      can: 'Õpilane lahendab kahe ja kolme tundmatuga lineaarvõrrandisüsteemi, uurib lahendite arvu parameetri järgi ja koostab tekstist süsteemi.',
      theory: [
        r`Asendusvõte: avalda ühest võrrandist üks tundmatu ja asenda teise. Liitmisvõte: liida võrrandid nii, et üks tundmatu kaob — *pähe*`,
        r`Süsteemil $\begin{cases}a_1x+b_1y=c_1\\a_2x+b_2y=c_2\end{cases}$ on üks lahend, kui $\dfrac{a_1}{a_2}\ne\dfrac{b_1}{b_2}$ (sirged lõikuvad) — *pähe*`,
        r`$\dfrac{a_1}{a_2}=\dfrac{b_1}{b_2}\ne\dfrac{c_1}{c_2}$: lahend puudub (paralleelsed sirged); kõik kolm suhet võrdsed: lõpmata palju lahendeid — *pähe*`,
        r`Kolm tundmatut (Gaussi võte): kõrvalda üks tundmatu kahest võrrandipaarist, lahenda saadud kahe tundmatuga süsteem — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai систем нет — способы подстановки и сложения учим наизусть.',
        'Две прямые: пересекаются — одно решение, параллельны — нет решений, совпадают — бесконечно много.',
        'Три неизвестных: исключи одно неизвестное из двух пар уравнений.',
      ],
      example: {
        task: r`Lahenda süsteem $\begin{cases}2x+3y=12\\x-y=1\end{cases}$ ja näita lahendit graafikul.`,
        steps: [
          r`Teisest võrrandist $x=1+y$.`,
          r`$2(1+y)+3y=12$, $\;5y=10$, $\;y=2$, $\;x=3$.`,
          r`Kontroll: $6+6=12$ ✓, $3-2=1$ ✓. Sirged $y=\dfrac{12-2x}3$ ja $y=x-1$ lõikuvad punktis $P(3;2)$.`,
        ],
        graph: { fns: 'y = (12 - 2x)/3\ny = x - 1', xmin: -1, xmax: 7, ymin: -2, ymax: 5, step: 1, stepY: 1, points: 'P(3; 2)', caption: 'tumesinine: 2x + 3y = 12 · roheline: x − y = 1' },
      },
      practice: [
        { title: 'Lahenda süsteem. Kirjuta vastus kujul (x;y).', parts: [
          [r`$\begin{cases}3x-2y=4\\5x+2y=12\end{cases}$`, 2, '(2;1)|2;1', r`Liidame: $8x=16$, $x=2$; $\;6-2y=4$, $y=1$.`],
          [r`$\begin{cases}\dfrac x2+\dfrac y3=4\\x-y=3\end{cases}$`, 2, '(6;3)|6;3', r`$3x+2y=24$ ja $x=y+3$: $5y+9=24$, $y=3$, $x=6$.`],
        ] },
        { title: r`Lahenda süsteem $\begin{cases}x+y+z=6\\2x-y+z=3\\x+2y-z=2\end{cases}$ Kirjuta vastus kujul (x;y;z).`, parts: [
          ['Leia lahend.', 4, '(1;2;3)|1;2;3', r`I + III: $2x+3y=8$. $\;$II + III: $3x+y=5$, $y=5-3x$. $\;2x+15-9x=8$, $x=1$, $y=2$; I-st $z=3$. Kontroll II: $2-2+3=3$ ✓.`, 5],
        ] },
        { title: r`Süsteem $\begin{cases}2x+ay=4\\x+3y=2\end{cases}$ parameetriga $a$.`, parts: [
          [r`Mis väärtusel $a$ on süsteemil lõpmata palju lahendeid?`, 2, '6', r`$\dfrac21=\dfrac a3=\dfrac42$, kui $a=6$.`],
          [r`Kas leidub $a$, mille korral lahend puudub? Kirjuta jah või ei.`, 1, 'ei', r`Paralleelsuseks peab olema $a=6$, aga siis on ka $\dfrac{c_1}{c_2}=2$ võrdne — sirged ühtivad. Seega ei.`, 1],
          [r`Lahenda süsteem, kui $a=4$.`, 2, '(2;0)|2;0', r`$x=2-3y$: $4-6y+4y=4$, $y=0$, $x=2$.`],
        ] },
        { title: 'Loomaaia piletid: kaks täiskasvanut ja kolm õpilast maksavad 39 €; täiskasvanu, õpilane ja pensionär kokku 25 €; kaks õpilase- ja kaks pensionäripiletit 26 €.', parts: [
          ['Koosta võrrandisüsteem (t, o, p — piletite hinnad).', 1, '', r`$\begin{cases}2t+3o=39\\t+o+p=25\\2o+2p=26\end{cases}$`, 2],
          ['Täiskasvanu pileti hind (€)', 1, '12', r`III-st $o+p=13$, II-st $t=25-13=12$.`, 2],
          ['Õpilase pileti hind (€)', 1, '5', r`$24+3o=39$, $o=5$.`, 1],
          ['Pensionäri pileti hind (€)', 1, '8', r`$p=13-5=8$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Parabool $y=ax^2+bx+c$ läbib punkte $A(-1;8)$, $B(1;2)$ ja $C(3;4)$.`, parts: [
        [r`Koosta kordajate $a$, $b$, $c$ leidmiseks võrrandisüsteem.`, 3, '', r`$\begin{cases}a-b+c=8\\a+b+c=2\\9a+3b+c=4\end{cases}$`, 3],
        [r`Leia $a$, $b$ ja $c$ (kirjuta $a; b; c$).`, 4, '1; -3; 4', r`I − II: $-2b=6$, $b=-3$. Siis $a+c=5$ ja $9a+c=13$: $8a=8$, $a=1$, $c=4$. Parabool $y=x^2-3x+4$.`, 4],
        ['Leia parabooli haripunkt.', 2, '(1,5;1,75)|1,5;1,75', r`$x_0=-\dfrac b{2a}=1{,}5$, $\;y_0=2{,}25-4{,}5+4=1{,}75$.`, 2],
        [r`Kas punkt $D(4;8)$ asub paraboolil? Kirjuta jah või ei.`, 1, 'jah', r`$16-12+4=8$ ✓.`, 1],
      ] },
      self: ['Lahendan süsteemi asendus- ja liitmisvõttega.', 'Lahendan kolme tundmatuga süsteemi.', 'Tean, millal süsteemil lahend puudub.'],
    },
    {
      title: 'Ruut- ja murdvõrrandite süsteemid',
      ru: 'Системы квадратных и дробных уравнений',
      course: 'II',
      exam: 'Laias eksamis on joonte lõikepunktid (sirge ja parabool, sirge ja ringjoon) ning tekstülesanded, kus tekib ruutvõrrandite süsteem.',
      can: 'Õpilane lahendab kahe tundmatuga ruut- ja murdvõrrandite süsteeme asendusvõtte, Viète’i teoreemi või uute muutujate abil ning lahendab tekstülesande.',
      theory: [
        r`Avalda lineaarsest võrrandist üks tundmatu ja asenda see ruutvõrrandisse — *pähe*`,
        r`Sümmeetriline süsteem: kui $x+y=s$ ja $xy=p$, siis $x$ ja $y$ on võrrandi $t^2-st+p=0$ lahendid — *pähe*`,
        r`$x^2+y^2=(x+y)^2-2xy$ — *pähe*`,
        r`Murdvõrrandite süsteemis: nimetajad $\ne0$; sageli aitab asendus $u=\dfrac1x$, $v=\dfrac1y$ — *pähe*`,
        r`Graafiliselt on süsteemi lahendid joonte lõikepunktid — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этого нет — приёмы подстановки и замены учим наизусть.',
        'Решение системы — это пара чисел (x; y); у нелинейной системы пар может быть несколько.',
        'В текстовой задаче проверь, что ответ имеет смысл (скорость и время положительны).',
      ],
      example: {
        task: r`Lahenda süsteem $\begin{cases}x^2+y^2=25\\x-y=1\end{cases}$`,
        steps: [
          r`$x=y+1$: $(y+1)^2+y^2=25$, $\;2y^2+2y-24=0$, $\;y^2+y-12=0$.`,
          r`$y=3$ või $y=-4$; vastavalt $x=4$ või $x=-3$.`,
          r`Vastus: $(4;3)$ ja $(-3;-4)$ — sirge lõikab ringjoont kahes punktis.`,
        ],
        graph: { fns: 'y = sqrt(25 - x^2)\ny = -sqrt(25 - x^2)\ny = x - 1', xmin: -6, xmax: 6, ymin: -6, ymax: 6, step: 1, stepY: 1, points: 'A(4; 3)\nB(-3; -4)', caption: 'ringjoon x² + y² = 25 · sirge y = x − 1' },
      },
      practice: [
        { title: 'Lahenda süsteem. Kirjuta kõik lahendid kujul (x;y).', parts: [
          [r`$\begin{cases}y=x^2-2x\\y=x+4\end{cases}$`, 3, '(4;8); (-1;3)', r`$x^2-2x=x+4$, $\;x^2-3x-4=0$, $x=4$ või $x=-1$; $y=8$ või $y=3$.`, 4],
        ] },
        { title: 'Sümmeetrilised süsteemid. Kirjuta kõik lahendid kujul (x;y).', parts: [
          [r`$\begin{cases}x+y=7\\xy=12\end{cases}$`, 2, '(3;4); (4;3)', r`$t^2-7t+12=0$, $t=3$ või $t=4$.`],
          [r`$\begin{cases}x^2+y^2=13\\xy=6\end{cases}$`, 3, '(2;3); (3;2); (-2;-3); (-3;-2)', r`$(x+y)^2=13+12=25$, $x+y=\pm5$. $x+y=5$: $(2;3)$, $(3;2)$; $\;x+y=-5$: $(-2;-3)$, $(-3;-2)$.`, 4],
        ] },
        { title: 'Murdvõrrandite süsteemid.', parts: [
          [r`$\begin{cases}\dfrac1x+\dfrac1y=\dfrac56\\x+y=5\end{cases}$ Kirjuta lahendid kujul (x;y).`, 2, '(2;3); (3;2)', r`$\dfrac{x+y}{xy}=\dfrac56$, seega $xy=6$; $t^2-5t+6=0$: $2$ ja $3$.`],
          [r`$\begin{cases}\dfrac3x-\dfrac2y=4\\\dfrac1x+\dfrac2y=8\end{cases}$ Kirjuta $x; y$.`, 3, '1/3; 0,4|1/3; 2/5', r`$u=\dfrac1x$, $v=\dfrac1y$: $3u-2v=4$, $u+2v=8$; liidame: $4u=12$, $u=3$, $v=2{,}5$. Seega $x=\dfrac13$, $y=0{,}4$.`, 4],
        ] },
        { title: 'Ristküliku pindala on 60 cm² ja diagonaal 13 cm.', parts: [
          ['Leia ristküliku küljed (cm).', 3, '12; 5', r`$xy=60$, $x^2+y^2=169$. $(x+y)^2=169+120=289$, $x+y=17$; $t^2-17t+60=0$: $12$ ja $5$.`, 4],
          ['Leia ümbermõõt (cm).', 1, '34', r`$2\cdot17=34$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Jalgrattur sõitis Pärnust Viljandisse 96 km. Tagasiteel oli tema keskmine kiirus 4 km/h suurem ja ta jõudis kohale 2 tundi kiiremini.', parts: [
        [r`Olgu $v$ (km/h) kiirus ja $t$ (h) aeg edasisõidul. Koosta võrrandisüsteem.`, 3, '', r`$\begin{cases}vt=96\\(v+4)(t-2)=96\end{cases}$`, 3],
        ['Leia kiirus edasisõidul (km/h).', 4, '12', r`Teisest: $vt-2v+4t-8=96$, seega $-2v+4t=8$, $v=2t-4$. $\;(2t-4)t=96$, $\;t^2-2t-48=0$, $t=8$ ($t=-6$ ei sobi). $v=12$ km/h.`, 5],
        ['Leia kiirus tagasiteel (km/h).', 1, '16', r`$12+4=16$ km/h`, 1],
        ['Mitu tundi kulus sõiduks kokku?', 2, '14', r`Edasi $8$ h, tagasi $8-2=6$ h, kokku $14$ h.`, 1],
      ] },
      self: ['Lahendan ruutvõrrandite süsteemi asendusvõttega.', 'Kasutan sümmeetrilises süsteemis Viète’i teoreemi.', 'Koostan tekstülesandest süsteemi ja kontrollin vastuse mõtet.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: II kursus',
      ru: 'Повторение и контрольная работа: II курс',
      course: 'II',
      exam: 'Kontrolltöö kordab võrrandeid ja süsteeme samas vormis nagu laia riigieksami I osa: iga õige samm annab punkti.',
      can: 'Õpilane lahendab II kursuse võrrandeid ja võrrandisüsteeme iseseisvalt ning kontrollib lahendeid.',
      theory: [
        r`$ax=b$: $a\ne0$ — üks lahend; $a=0$, $b\ne0$ — lahend puudub; $a=b=0$ — iga $x$ — *pähe*`,
        r`$D=b^2-4ac$, $\;x=\dfrac{-b\pm\sqrt D}{2a}$; Viète $x_1+x_2=-\dfrac ba$, $x_1x_2=\dfrac ca$ — *pähe*`,
        r`Murdvõrrand: nimetaja $\ne0$; juurvõrrand: pärast ruutu tõstmist kontroll — *pähe*`,
        r`$|A|=c$ ($c\ge0$) $\Leftrightarrow A=\pm c$; mitme mooduliga võrrand vahemike kaupa — *pähe*`,
        r`Süsteemid: asendus- ja liitmisvõte, sümmeetriline süsteem $t^2-st+p=0$ — *pähe*`,
      ],
      ru_hint: [
        'Контрольная: 25 баллов, 45 минут. На листе формул lai этих формул нет — всё по памяти.',
        'В дробных и иррациональных уравнениях обязательно проверка корней.',
        'Пиши каждый шаг: балл дают за каждый верный шаг.',
      ],
      example: {
        task: r`Lahenda võrrand $\dfrac{x+2}{x-1}-\dfrac{3}{x+1}=\dfrac{6}{x^2-1}$.`,
        steps: [
          r`$x\ne1$, $x\ne-1$. Korrutame $(x-1)(x+1)$-ga: $(x+2)(x+1)-3(x-1)=6$.`,
          r`$x^2+3x+2-3x+3=6$, $\;x^2=1$, $\;x=\pm1$.`,
          r`Mõlemad on võõrlahendid. Vastus: lahend puudub.`,
        ],
      },
      practice: [
        { title: 'Lahenda. Kui lahendit ei ole, kirjuta puudub.', parts: [
          [r`$4x^2-4x+1=0$`, 1, '0,5|1/2', r`$(2x-1)^2=0$, $x=0{,}5$.`, 1],
          [r`$x^2+6x+10=0$`, 1, 'puudub|∅', r`$D=36-40<0$.`, 1],
        ] },
        { title: 'Lahenda.', parts: [
          [r`$\sqrt{x+1}=x-5$`, 2, '8', r`$x+1=x^2-10x+25$, $x^2-11x+24=0$: $3$ ja $8$. $x=3$: $2\ne-2$ ✗; $x=8$: $3=3$ ✓.`],
          [r`$|3x-1|=5$`, 2, '2; -4/3|2; -1,33', r`$3x-1=5$: $x=2$; $\;3x-1=-5$: $x=-\dfrac43$.`],
        ] },
        { title: r`Lahenda süsteem $\begin{cases}x+2y=5\\3x-y=1\end{cases}$`, parts: [
          ['Kirjuta vastus kujul (x;y).', 2, '(1;2)|1;2', r`$x=5-2y$: $15-6y-y=1$, $y=2$, $x=1$.`],
        ] },
        { title: r`Võrrandi $x^2+px+12=0$ üks lahend on $3$.`, parts: [
          ['Leia teine lahend.', 1, '4', r`$x_1x_2=12$: $x_2=4$.`, 1],
          [r`Leia $p$.`, 1, '-7', r`$p=-(3+4)=-7$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'II kursus: võrrandid ja võrrandisüsteemid. Aega 45 minutit.', parts: [
        [r`1. Mis väärtusel $a$ on võrrandil $(a+1)x=a^2-1$ lõpmata palju lahendeid?`, 2, '-1', r`$a=-1$: $0\cdot x=0$ — sobib iga $x$.`, 2],
        [r`2. Lahenda $3x^2-5x-2=0$.`, 2, '2; -1/3|2; -0,33', r`$D=25+24=49$, $x=\dfrac{5\pm7}{6}$: $2$ ja $-\dfrac13$.`, 2],
        [r`3. Mis väärtustel $k$ on võrrandil $x^2+kx+16=0$ täpselt üks lahend?`, 3, '8; -8', r`$D=k^2-64=0$, $k=\pm8$.`, 2],
        [r`4. Lahenda $\dfrac{x}{x-3}+\dfrac{3}{x+3}=\dfrac{18}{x^2-9}$.`, 3, '-9', r`$x\ne\pm3$. $x(x+3)+3(x-3)=18$, $x^2+6x-27=0$: $x=3$ (võõrlahend) või $x=-9$.`, 4],
        [r`5. Lahenda $\sqrt{2x+7}=x+2$.`, 3, '1', r`$2x+7=x^2+4x+4$, $x^2+2x-3=0$: $1$ ja $-3$. $x=-3$: $1\ne-1$ ✗. Vastus $1$.`, 4],
        [r`6. Lahenda $|x-2|+|x+1|=5$.`, 3, '-2; 3', r`$x<-1$: $1-2x=5$, $x=-2$ ✓. $\;-1\le x<2$: $3\ne5$. $\;x\ge2$: $2x-1=5$, $x=3$ ✓.`, 4],
        [r`7. Lahenda $\begin{cases}x+y-z=1\\x-y+z=3\\-x+y+z=5\end{cases}$ Vastus kujul (x;y;z).`, 4, '(2;3;4)|2;3;4', r`I + II: $2x=4$, $x=2$. II + III: $2z=8$, $z=4$. I + III: $2y=6$, $y=3$.`, 4],
        ['8. Ristkülikukujulise aiamaa ümbermõõt on 28 m ja diagonaal 10 m. Leia aiamaa küljed (m).', 5, '6; 8', r`$x+y=14$, $x^2+y^2=100$. $xy=\dfrac{196-100}2=48$; $t^2-14t+48=0$: $6$ ja $8$ m.`, 5],
      ] },
      self: ['Oskan II kursuse kõiki võrranditüüpe.', 'Kontrollin võõrlahendeid.', 'Lahendan süsteemi ja tekstülesande.'],
    },

    // ───────────── III kursus „Võrratused. Trigonomeetria I” ─────────────
    {
      title: 'Võrratuse omadused ja lineaarvõrratused',
      ru: 'Свойства неравенств и линейные неравенства',
      course: 'III',
      exam: 'Laia riigieksami I osa 5-punktiline ülesanne on sageli võrratus; lineaarvõrratus on ka iga määramispiirkonna ja tekstülesande osa.',
      can: 'Õpilane kasutab võrratuse omadusi, lahendab lineaar- ja ahelvõrratusi, tõestab lihtsa võrratuse ning lahendab tekstülesande võrratuse abil.',
      theory: [
        r`Kui $a<b$, siis $a+c<b+c$; $\;c>0$ korral $ac<bc$, $\;c<0$ korral $ac>bc$ (märk pöördub) — *pähe*`,
        r`$ax>b$: kui $a>0$, siis $x>\dfrac ba$; kui $a<0$, siis $x<\dfrac ba$ — *pähe*`,
        r`Ahelvõrratus $m<ax+b\le n$: teeme sama tehte kõigi kolme osaga korraga — *pähe*`,
        r`Range ($<$, $>$) ja mitterange ($\le$, $\ge$) võrratus; vastus vahemikuna: ümarsulg — otspunkt ei kuulu, nurksulg — kuulub — *pähe*`,
        r`$a^2+b^2\ge2ab$ ja $\dfrac{a+b}{2}\ge\sqrt{ab}$ ($a,b\ge0$); võrdus ainult siis, kui $a=b$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет ничего про неравенства — свойства неравенств учим наизусть.',
        'Умножаем или делим на отрицательное число — знак неравенства меняется на противоположный.',
        'Двойное неравенство решаем сразу во всех трёх частях. Доказательство: перенеси всё в одну сторону и получи квадрат ≥ 0.',
      ],
      example: {
        task: r`Lahenda võrratus $\dfrac{x-1}{3}-\dfrac{2x+1}{4}\le\dfrac16$.`,
        steps: [
          r`Korrutame pooled positiivse arvuga $12$ (märk jääb): $4(x-1)-3(2x+1)\le2$.`,
          r`$4x-4-6x-3\le2$, $\;-2x\le9$.`,
          r`Jagame negatiivse arvuga $-2$, märk pöördub: $x\ge-4{,}5$.`,
          r`Graafikul on $y=\frac{x-1}{3}-\frac{2x+1}{4}$ sirgest $y=\frac16$ allpool, kui $x\ge-4{,}5$. Vastus: $[-4{,}5;\infty)$.`,
        ],
        graph: { fns: 'y = (x - 1)/3 - (2x + 1)/4\ny = 1/6', xmin: -8, xmax: 2, ymin: -1, ymax: 2, step: 1, stepY: 0.5, labelEvery: 1, points: 'A(-4.5; 0.17)', caption: 'tumesinine: vasak pool · roheline: y = 1/6' },
      },
      practice: [
        { title: r`On teada, et $a<b$. Kirjuta lünka märk $<$ või $>$.`, parts: [
          [r`$-3a\;\_\_\;-3b$`, 1, '>', r`Korrutame negatiivse arvuga $-3$: märk pöördub, $-3a>-3b$.`, 0],
          [r`$a-5\;\_\_\;b-5$`, 1, '<', r`Liitmine ja lahutamine märki ei muuda: $a-5<b-5$.`, 0],
          [r`$\dfrac a2\;\_\_\;\dfrac b2$`, 1, '<', r`Jagame positiivse arvuga: $\dfrac a2<\dfrac b2$.`, 0],
        ] },
        { title: 'Lahenda võrratus. Kirjuta vastus vahemikuna.', parts: [
          [r`$3x-7>5$`, 1, '(4;∞)|x>4', r`$3x>12$, $x>4$.`, 2],
          [r`$5-2x\ge11$`, 2, '(-∞;-3]|x<=-3|x≤-3', r`$-2x\ge6$; jagame arvuga $-2$, märk pöördub: $x\le-3$.`, 2],
          [r`$\dfrac{2x-1}{3}-\dfrac x2<1$`, 2, '(-∞;8)|x<8', r`Korrutame $6$-ga: $2(2x-1)-3x<6$, $\;4x-2-3x<6$, $\;x<8$.`, 3],
        ] },
        { title: 'Ahelvõrratus.', parts: [
          [r`Lahenda $-3<2x+1\le7$.`, 2, '(-2;3]|-2<x<=3|-2<x≤3', r`Lahutame $1$: $-4<2x\le6$; jagame $2$-ga: $-2<x\le3$.`, 2],
          [r`Mitu täisarvu rahuldab eelmist võrratust?`, 1, '5', r`$-1;\,0;\,1;\,2;\,3$ — viis täisarvu.`, 1],
          [r`Lahenda $-1\le\dfrac{4-3x}{2}<5$.`, 2, '(-2;2]|-2<x<=2|-2<x≤2', r`$-2\le4-3x<10$, $\;-6\le-3x<6$; jagame $-3$-ga, mõlemad märgid pöörduvad: $2\ge x>-2$, s.t $-2<x\le2$.`, 3],
        ] },
        { title: 'Tõestus.', parts: [
          [r`Tõesta, et iga $a$ ja $b$ korral $a^2+b^2\ge2ab$.`, 2, '', r`$a^2+b^2-2ab=(a-b)^2\ge0$, sest ruut ei ole negatiivne. Seega $a^2+b^2\ge2ab$.`, 3],
          [r`Tõesta, et iga $a>0$ korral $a+\dfrac1a\ge2$.`, 2, '', r`$a+\dfrac1a-2=\dfrac{a^2-2a+1}{a}=\dfrac{(a-1)^2}{a}\ge0$, sest lugeja $\ge0$ ja $a>0$.`, 3],
          [r`Millise $a$ korral kehtib $a+\dfrac1a=2$?`, 1, '1', r`Võrdus on siis, kui $(a-1)^2=0$, s.t $a=1$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Takso A sõit maksab $3{,}50$ € alustasu ja $0{,}90$ € iga kilomeetri eest, takso B sõit $2$ € alustasu ja $1{,}15$ € kilomeetri eest. Sõidu pikkus on $x$ km.`, parts: [
        [r`Millise sõidupikkuse korral on takso A odavam kui takso B?`, 3, '(6;∞)|x>6', r`$3{,}5+0{,}9x<2+1{,}15x$, $\;1{,}5<0{,}25x$, $\;x>6$ km.`, 4],
        [r`Kui pika sõidu saab teha taksoga A, kui raha on $20$ €? Vastus kahe kümnendkohaga.`, 2, '18,33', r`$3{,}5+0{,}9x\le20$, $\;0{,}9x\le16{,}5$, $\;x\le18{,}33$ km.`, 3],
        [r`Taksoga B tahetakse maksta vähemalt $15$ € ja kõige rohkem $25$ €. Leia lühim ja pikim sõit (kahe kümnendkohaga).`, 3, '11,30; 20', r`$15\le2+1{,}15x\le25$, $\;13\le1{,}15x\le23$, $\;11{,}30\le x\le20$ km.`, 4],
        [r`Millise sõidupikkuse korral on takso A rohkem kui $1$ € kallim kui takso B?`, 2, '(0;2)|0<x<2', r`$(3{,}5+0{,}9x)-(2+1{,}15x)>1$, $\;1{,}5-0{,}25x>1$, $\;x<2$; sõit on positiivne: $0<x<2$ km.`, 3],
      ] },
      self: ['Pööran märgi, kui korrutan negatiivse arvuga.', 'Lahendan ahelvõrratuse kõigis osades korraga.', 'Tõestan võrratuse ruudu abil.'],
    },
    {
      title: 'Ruutvõrratused',
      ru: 'Квадратные неравенства',
      course: 'III',
      exam: 'Ruutvõrratus on laia riigieksami I osa 5-punktilises ülesandes ning funktsiooni uurimisel (positiivsus- ja kasvamispiirkond).',
      can: 'Õpilane lahendab ruutvõrratuse parabooli skitsi abil, ka mittetäieliku ja parameetriga ruutvõrratuse.',
      theory: [
        r`$ax^2+bx+c>0$: leia nullkohad, skitseeri parabool ($a>0$ — harud üles), loe vastus jooniselt — *pähe*`,
        r`$a>0$, $x_1<x_2$: $\;ax^2+bx+c<0\Leftrightarrow x_1<x<x_2$; $\;ax^2+bx+c>0\Leftrightarrow x<x_1$ või $x>x_2$ — *pähe*`,
        r`Kui $D<0$ ja $a>0$, siis $ax^2+bx+c>0$ iga $x$ korral; kui $D=0$, puudutab parabool $x$-telge — *pähe*`,
        r`Mittetäielik: $x^2<9\Leftrightarrow-3<x<3$; $\;x^2\ge4x\Leftrightarrow x(x-4)\ge0$ (ära jaga $x$-ga!) — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет формулы корней квадратного уравнения — её и правила квадратных неравенств знаем наизусть.',
        'Решаем через параболу: находим корни, рисуем эскиз, ответ читаем по рисунку.',
        'Нельзя делить обе части на x — так теряются решения. Выносим x за скобку.',
      ],
      example: {
        task: r`Lahenda võrratus $-x^2+2x+8\ge0$.`,
        steps: [
          r`Nullkohad: $-x^2+2x+8=0\Leftrightarrow x^2-2x-8=0$, $\;x_1=-2$, $x_2=4$.`,
          r`$a=-1<0$: parabooli harud on alla, parabool on $x$-teljest kõrgemal nullkohtade vahel.`,
          r`Võrratus on mitterange, nullkohad kuuluvad lahendisse. Vastus: $[-2;4]$.`,
        ],
        graph: { fns: 'y = -x^2 + 2x + 8', xmin: -4, xmax: 6, ymin: -4, ymax: 10, step: 1, stepY: 2, points: 'A(-2; 0)\nB(4; 0)', caption: 'y = −x² + 2x + 8 ≥ 0 lõigul [−2; 4]' },
      },
      practice: [
        { title: 'Lahenda võrratus.', parts: [
          [r`$x^2-5x+6<0$`, 1, '(2;3)|2<x<3', r`Nullkohad $2$ ja $3$; harud üles, negatiivne vahel: $2<x<3$.`, 2],
          [r`$x^2-16\ge0$`, 2, '(-∞;-4]∪[4;∞)|x<=-4;x>=4|x≤-4;x≥4', r`$(x-4)(x+4)\ge0$: $x\le-4$ või $x\ge4$.`, 2],
          [r`$3x^2\le12x$`, 2, '[0;4]|0<=x<=4|0≤x≤4', r`$3x^2-12x\le0$, $\;3x(x-4)\le0$: $0\le x\le4$.`, 2],
        ] },
        { title: 'Lahenda võrratus.', parts: [
          [r`$2x^2+x-3>0$`, 2, '(-∞;-1,5)∪(1;∞)|x<-1,5;x>1', r`$D=1+24=25$, $x=\dfrac{-1\pm5}{4}$: $1$ ja $-1{,}5$. Harud üles: $x<-1{,}5$ või $x>1$.`, 3],
          [r`$x^2+4x+5>0$`, 1, 'R|(-∞;∞)|ℝ', r`$D=16-20<0$ ja $a>0$: parabool on kogu aeg $x$-teljest kõrgemal, lahend on iga $x$.`, 2],
          [r`$x^2+6x+9\le0$`, 1, '-3', r`$(x+3)^2\le0$ ainult siis, kui $x+3=0$: $x=-3$.`, 2],
        ] },
        { title: r`Parameetriga võrratus $x^2+px+9>0$.`, parts: [
          [r`Leia $p$ väärtused, mille korral võrratus kehtib iga $x$ korral.`, 3, '(-6;6)|-6<p<6', r`Vaja $D<0$: $p^2-36<0$, $\;-6<p<6$.`, 3],
          [r`Millise $p$ korral on võrrandil $x^2+px+9=0$ täpselt üks lahend?`, 1, '6; -6', r`$D=p^2-36=0$: $p=6$ või $p=-6$.`, 1],
          [r`Lahenda $x^2+10x+9<0$ (s.t $p=10$ ja märk vastupidine).`, 2, '(-9;-1)|-9<x<-1', r`Nullkohad $-9$ ja $-1$; negatiivne vahel: $-9<x<-1$.`, 2],
        ] },
        { title: 'Lahenda, avades sulud või kasutades ruutu.', parts: [
          [r`$(2x-1)^2>9$`, 2, '(-∞;-1)∪(2;∞)|x<-1;x>2', r`$|2x-1|>3$: $2x-1>3$ või $2x-1<-3$, s.t $x>2$ või $x<-1$.`, 2],
          [r`$(x-3)(x+5)\ge-15$`, 2, '(-∞;-2]∪[0;∞)|x<=-2;x>=0|x≤-2;x≥0', r`$x^2+2x-15\ge-15$, $\;x^2+2x\ge0$, $\;x(x+2)\ge0$: $x\le-2$ või $x\ge0$.`, 3],
          [r`Leia suurim täisarv, mis rahuldab võrratust $x^2-3x-10<0$.`, 1, '4', r`Nullkohad $5$ ja $-2$: $-2<x<5$; suurim täisarv on $4$.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Ristkülikukujulise peenra ümbermõõt on $40$ m. Ühe külje pikkus on $x$ m.`, grid: { xmin: -1, xmax: 21, ymin: -10, ymax: 110, step: 2, stepY: 10, labelEvery: 2, blank: true }, parts: [
        [r`Avalda peenra pindala $S(x)$.`, 2, '20x-x^2|x(20-x)|20x-x²', r`Teine külg on $20-x$, $\;S(x)=x(20-x)=20x-x^2$.`, 2],
        [r`Millise $x$ korral on pindala vähemalt $64$ m²?`, 4, '[4;16]|4<=x<=16|4≤x≤16', r`$20x-x^2\ge64$, $\;x^2-20x+64\le0$; nullkohad $4$ ja $16$; vastus $4\le x\le16$.`, 4],
        [r`Joonesta funktsiooni $S(x)$ graafik ($0\le x\le20$) ja märgi sellel b) vastus.`, 2, '', r`Parabool läbib punkte $(0;0)$, $(20;0)$, haripunkt $(10;100)$; lõigul $[4;16]$ on graafik sirgest $S=64$ kõrgemal.`, 0],
        [r`Leia suurim pindala.`, 2, '100', r`Haripunkt $x=\dfrac{0+20}{2}=10$, $\;S(10)=100$ m² (ruut).`, 2],
      ] },
      self: ['Leian nullkohad ja skitseerin parabooli.', 'Loen vastuse jooniselt, ka siis, kui D < 0.', 'Lahendan parameetriga ülesande diskriminandi abil.'],
    },
    {
      title: 'Murdvõrratused ja intervallmeetod',
      ru: 'Дробные неравенства и метод интервалов',
      course: 'III',
      exam: 'Murdvõrratus on laia riigieksami I osa 5-punktilises ülesandes ning funktsiooni määramispiirkonna ja märgi uurimisel.',
      can: 'Õpilane lahendab murdvõrratuse ja kõrgema astme võrratuse intervallmeetodiga ning põhjendab, miks nimetajaga ei korrutata.',
      theory: [
        r`$\dfrac{f(x)}{g(x)}>0\Leftrightarrow f(x)\cdot g(x)>0$; nimetaja $g(x)\ne0$ — *pähe*`,
        r`Murdvõrratuse pooli ei korruta nimetajaga (selle märk on teadmata): vii kõik ühele poole ja ühise nimetaja alla — *pähe*`,
        r`Intervallmeetod: lugeja ja nimetaja nullkohad arvteljele, märk igas vahemikus; paarisarvulise kordsusega nullkohas märk ei vahetu — *pähe*`,
        r`Mitterange võrratus: lugeja nullkohad kuuluvad lahendisse, nimetaja nullkohad mitte kunagi — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет метода интервалов — алгоритм знаем наизусть.',
        'Нельзя умножать на знаменатель: неизвестно, положительный он или отрицательный. Переносим всё в одну сторону.',
        'Корни знаменателя всегда «выколоты» — круглая скобка.',
      ],
      example: {
        task: r`Lahenda võrratus $\dfrac{x+3}{x-2}\le2$.`,
        steps: [
          r`$\dfrac{x+3}{x-2}-2\le0$, $\;\dfrac{x+3-2x+4}{x-2}\le0$, $\;\dfrac{7-x}{x-2}\le0$, s.t $\dfrac{x-7}{x-2}\ge0$.`,
          r`Nullkohad $7$ (lugeja, kuulub) ja $2$ (nimetaja, ei kuulu). Märgid: $x<2$: $+$; $\;2<x<7$: $-$; $\;x>7$: $+$.`,
          r`Vastus: $(-\infty;2)\cup[7;\infty)$. Graafikul on hüperbool sirgest $y=2$ allpool just neil $x$-del.`,
        ],
        graph: { fns: 'y = (x + 3)/(x - 2)\ny = 2', xmin: -4, xmax: 10, ymin: -6, ymax: 8, step: 1, stepY: 2, points: 'P(7; 2)', caption: 'tumesinine: y = (x + 3)/(x − 2) · roheline: y = 2' },
      },
      practice: [
        { title: 'Lahenda võrratus.', parts: [
          [r`$\dfrac{x-4}{x+1}<0$`, 1, '(-1;4)|-1<x<4', r`Nullkohad $-1$ ja $4$; murd on negatiivne nende vahel: $-1<x<4$.`, 2],
          [r`$\dfrac{2x+6}{x-5}\ge0$`, 2, '(-∞;-3]∪(5;∞)|x<=-3;x>5|x≤-3;x>5', r`Lugeja nullkoht $-3$ (kuulub), nimetaja nullkoht $5$ (ei kuulu): $x\le-3$ või $x>5$.`, 2],
          [r`$\dfrac{3}{x-2}>0$`, 1, '(2;∞)|x>2', r`Lugeja $3>0$, seega peab nimetaja olema positiivne: $x>2$.`, 1],
        ] },
        { title: 'Lahenda intervallmeetodiga.', parts: [
          [r`$(x+2)(x-1)(x-4)>0$`, 2, '(-2;1)∪(4;∞)|-2<x<1;x>4', r`Nullkohad $-2$, $1$, $4$. Paremalt: $x>4$: $+$; $(1;4)$: $-$; $(-2;1)$: $+$; $x<-2$: $-$. Vastus $(-2;1)\cup(4;\infty)$.`, 3],
          [r`$(x-3)^2(x+1)\le0$`, 2, '(-∞;-1]∪{3}|x<=-1;x=3|x≤-1;x=3', r`$(x-3)^2\ge0$; võrdus $0$-ga kohal $x=3$. Muidu peab $x+1\le0$. Vastus: $x\le-1$ või $x=3$.`, 3],
          [r`$\dfrac{x(x-5)}{x+3}\ge0$`, 2, '(-3;0]∪[5;∞)|-3<x<=0;x>=5|-3<x≤0;x≥5', r`Nullkohad $-3$ (nimetaja), $0$, $5$. Märgid: $x<-3$: $-$; $(-3;0)$: $+$; $(0;5)$: $-$; $x>5$: $+$. Vastus $(-3;0]\cup[5;\infty)$.`, 3],
        ] },
        { title: 'Vii kõik ühele poole.', parts: [
          [r`$\dfrac{x+1}{x-3}>1$`, 2, '(3;∞)|x>3', r`$\dfrac{x+1-(x-3)}{x-3}>0$, $\;\dfrac{4}{x-3}>0$: $x>3$.`, 3],
          [r`$\dfrac1x<2$`, 2, '(-∞;0)∪(0,5;∞)|x<0;x>0,5', r`$\dfrac{1-2x}{x}<0$, s.t $\dfrac{2x-1}{x}>0$: $x<0$ või $x>0{,}5$.`, 3],
          [r`Mari korrutas võrratuse $\dfrac1x<2$ pooled $x$-ga ja sai vastuseks $x>0{,}5$. Selgita viga ja nimeta üks lahend, mis tal puudu jäi.`, 1, '', r`Kui $x<0$, pöördub korrutamisel märk; Mari kaotas kõik negatiivsed lahendid, nt $x=-1$: $\frac1{-1}=-1<2$.`, 2],
        ] },
        { title: 'Kui lugeja või nimetaja märk on teada.', parts: [
          [r`$\dfrac{x^2-4}{x^2+1}\le0$`, 2, '[-2;2]|-2<=x<=2|-2≤x≤2', r`$x^2+1>0$ alati, seega $x^2-4\le0$: $-2\le x\le2$.`, 2],
          [r`$\dfrac{x^2+2}{5-x}<0$`, 1, '(5;∞)|x>5', r`Lugeja $>0$, seega $5-x<0$: $x>5$.`, 1],
          [r`$\dfrac{(x-1)^2}{x+3}<0$`, 1, '(-∞;-3)|x<-3', r`Lugeja $\ge0$; murd on negatiivne, kui lugeja $\ne0$ ja $x+3<0$: $x<-3$.`, 1],
          [r`$\dfrac{(x-1)^2}{x+3}\le0$`, 1, '(-∞;-3)∪{1}|x<-3;x=1', r`Lisandub lugeja nullkoht $x=1$: $x<-3$ või $x=1$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Antud on funktsioon $f(x)=\sqrt{\dfrac{x+4}{3-x}}$.`, parts: [
        [r`Kirjuta võrratus, mida peab rahuldama $x$, et $f(x)$ oleks määratud.`, 1, '', r`Juuritav ei ole negatiivne ja nimetaja $\ne0$: $\dfrac{x+4}{3-x}\ge0$.`, 1],
        [r`Leia funktsiooni määramispiirkond.`, 3, '[-4;3)|-4<=x<3|-4≤x<3', r`$\dfrac{x+4}{3-x}\ge0\Leftrightarrow\dfrac{x+4}{x-3}\le0$. Nullkohad $-4$ (kuulub) ja $3$ (ei kuulu); murd $\le0$ nende vahel: $-4\le x<3$.`, 4],
        [r`Mitu täisarvu kuulub määramispiirkonda?`, 1, '7', r`$-4;-3;-2;-1;0;1;2$ — seitse täisarvu.`, 1],
      ] },
      self: ['Viin kõik võrratuse ühele poole ja ühise nimetaja alla.', 'Märgin arvteljel märgid igas vahemikus.', 'Tean, et nimetaja nullkoht ei kuulu kunagi vastusesse.'],
    },
    {
      title: 'Võrratusesüsteemid ja absoluutväärtusega võrratused',
      ru: 'Системы неравенств и неравенства с модулем',
      course: 'III',
      exam: 'Võrratusesüsteem on laia riigieksami tekstülesannetes (lubatud väärtused) ja funktsiooni määramispiirkonnas; absoluutväärtus kirjeldab lubatud hälvet.',
      can: 'Õpilane lahendab võrratusesüsteemi, absoluutväärtusega võrratuse ja tekstülesande, kus on mitu tingimust.',
      theory: [
        r`Süsteem: lahenda iga võrratus eraldi lõpuni, siis leia lahendihulkade ühisosa (arvteljel) — *pähe*`,
        r`$r>0$: $\;|x-a|<r\Leftrightarrow a-r<x<a+r$; $\;|x-a|>r\Leftrightarrow x<a-r$ või $x>a+r$ — *pähe*`,
        r`$|f(x)|<g(x)\Leftrightarrow-g(x)<f(x)<g(x)$; $\;|f(x)|<0$ lahend puudub — *pähe*`,
        r`Ahelvõrratus $m<f(x)<n$ on süsteem $\begin{cases}f(x)>m\\f(x)<n\end{cases}$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этого нет — правила для систем и модуля учим наизусть.',
        'Система: каждое неравенство до конца отдельно, потом пересечение на числовой оси.',
        '|x − a| < r — точки ближе r к числу a; |x − a| > r — дальше r.',
      ],
      example: {
        task: r`Lahenda süsteem $\begin{cases}x^2-x-6<0\\2x-1\ge0\end{cases}$`,
        steps: [
          r`Esimene: nullkohad $-2$ ja $3$, seega $-2<x<3$.`,
          r`Teine: $x\ge0{,}5$.`,
          r`Ühisosa: $0{,}5\le x<3$. Graafikul on parabool $x$-teljest allpool ja sirge $y=2x-1$ mitte allpool. Vastus: $[0{,}5;3)$.`,
        ],
        graph: { fns: 'y = x^2 - x - 6\ny = 2x - 1', xmin: -3, xmax: 5, ymin: -7, ymax: 7, step: 1, stepY: 2, points: 'A(0.5; 0)\nB(3; 0)', caption: 'tumesinine: y = x² − x − 6 · roheline: y = 2x − 1' },
      },
      practice: [
        { title: 'Lahenda süsteem.', parts: [
          [r`$\begin{cases}3x-2>4\\10-x\ge3\end{cases}$`, 2, '(2;7]|2<x<=7|2<x≤7', r`$x>2$ ja $x\le7$: $2<x\le7$.`, 2],
          [r`$\begin{cases}x^2\le9\\x+1>0\end{cases}$`, 2, '(-1;3]|-1<x<=3|-1<x≤3', r`$-3\le x\le3$ ja $x>-1$: $-1<x\le3$.`, 2],
          [r`$\begin{cases}x^2-4x>0\\x<6\end{cases}$`, 2, '(-∞;0)∪(4;6)|x<0;4<x<6', r`$x(x-4)>0$: $x<0$ või $x>4$; koos $x<6$-ga: $(-\infty;0)\cup(4;6)$.`, 3],
        ] },
        { title: 'Absoluutväärtusega võrratus.', parts: [
          [r`$|2x-3|\le5$`, 2, '[-1;4]|-1<=x<=4|-1≤x≤4', r`$-5\le2x-3\le5$, $\;-2\le2x\le8$, $\;-1\le x\le4$.`, 2],
          [r`$|x+2|>3$`, 2, '(-∞;-5)∪(1;∞)|x<-5;x>1', r`$x+2>3$ või $x+2<-3$: $x>1$ või $x<-5$.`, 2],
          [r`$|3-x|<0$`, 1, '∅|tühihulk|puudub', r`Absoluutväärtus ei ole kunagi negatiivne: lahend puudub, $\varnothing$.`, 1],
        ] },
        { title: r`Võrratus $|x^2-5|<4$.`, parts: [
          [r`Lahenda võrratus.`, 3, '(-3;-1)∪(1;3)|-3<x<-1;1<x<3', r`$-4<x^2-5<4$, $\;1<x^2<9$. $x^2>1$: $|x|>1$; $x^2<9$: $|x|<3$. Kokku $(-3;-1)\cup(1;3)$.`, 4],
          [r`Mitu täisarvu rahuldab võrratust?`, 1, '2', r`Täisarvud $-2$ ja $2$.`, 1],
        ] },
        { title: r`Süsteem $\begin{cases}x\ge2\\x<a\end{cases}$ parameetriga $a$.`, parts: [
          [r`Millise $a$ korral on süsteemil lahendeid?`, 1, '(2;∞)|a>2', r`Lahendihulk on $[2;a)$; see ei ole tühi, kui $a>2$.`, 1],
          [r`Millise $a$ korral on süsteemil täpselt kolm täisarvulist lahendit?`, 2, '(4;5]|4<a<=5|4<a≤5', r`Täisarvud peavad olema $2;3;4$: $4<a$ ($4$ kuulub) ja $a\le5$ ($5$ ei kuulu).`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Väikeettevõtte kuukasum (tuhandetes eurodes) on $P(x)=-x^2+14x-24$, kus $x$ on toodang tuhandetes tükkides. Tootmisvõimsus on kuni $10$ tuhat tükki, s.t $0\le x\le10$.`, parts: [
        [r`Kui suur on kahjum, kui toodang on $1$ tuhat tükki (tuhandetes eurodes)?`, 1, '11', r`$P(1)=-1+14-24=-11$: kahjum $11$ tuhat eurot.`, 1],
        [r`Millise toodangu korral on kasum positiivne?`, 3, '(2;10]|2<x<=10|2<x≤10', r`$-x^2+14x-24>0\Leftrightarrow x^2-14x+24<0$; nullkohad $2$ ja $12$: $2<x<12$. Koos tingimusega $0\le x\le10$: $2<x\le10$.`, 4],
        [r`Millise toodangu korral on kasum vähemalt $16$ tuhat eurot?`, 3, '[4;10]|4<=x<=10|4≤x≤10', r`$-x^2+14x-24\ge16$, $\;x^2-14x+40\le0$; nullkohad $4$ ja $10$: $4\le x\le10$ (sobib võimsusega).`, 4],
        [r`Kirjuta eelmise osa vastus kujul $|x-a|\le r$.`, 1, '', r`Lõigu $[4;10]$ keskpunkt $7$, poolpikkus $3$: $|x-7|\le3$.`, 1],
        [r`Leia suurim kasum ja toodang, mille korral see saavutatakse.`, 2, '7; 25', r`Haripunkt $x=\dfrac{14}{2}=7$, $\;P(7)=-49+98-24=25$: suurim kasum $25$ tuhat eurot toodangu $7$ tuhat korral.`, 2],
      ] },
      self: ['Lahendan süsteemi iga võrratuse eraldi ja leian ühisosa.', 'Lahendan |x − a| < r ja |x − a| > r.', 'Arvestan tekstülesandes lisatingimusi.'],
    },
    {
      title: 'Teravnurga trigonomeetrilised funktsioonid',
      ru: 'Тригонометрические функции острого угла',
      course: 'III',
      exam: 'Laia riigieksami geomeetria- ja stereomeetriaülesanded (I-7, II-12) algavad täisnurksest kolmnurgast; täpseid väärtusi valemilehel ei ole.',
      can: 'Õpilane defineerib teravnurga siinuse, koosinuse ja tangensi, tuletab nurkade 30°, 45°, 60° täpsed väärtused ja leiab nurga väärtuse järgi.',
      theory: [
        r`$\sin\alpha=\dfrac{\text{vastaskaatet}}{\text{hüpotenuus}}$, $\;\cos\alpha=\dfrac{\text{lähiskaatet}}{\text{hüpotenuus}}$, $\;\tan\alpha=\dfrac{\text{vastaskaatet}}{\text{lähiskaatet}}$ — *pähe*`,
        r`Teravnurga korral $0<\sin\alpha<1$, $\;0<\cos\alpha<1$, $\;\tan\alpha>0$ — *pähe*`,
        r`$\sin30^\circ=\cos60^\circ=\frac12$, $\;\sin60^\circ=\cos30^\circ=\frac{\sqrt3}2$, $\;\sin45^\circ=\cos45^\circ=\frac{\sqrt2}2$; $\;\tan30^\circ=\frac{\sqrt3}3$, $\tan45^\circ=1$, $\tan60^\circ=\sqrt3$ — *pähe*`,
        r`Nurk väärtuse järgi: $\alpha=\sin^{-1}(\dots)$, $\cos^{-1}(\dots)$, $\tan^{-1}(\dots)$ kalkulaatoriga kraadirežiimis — *pähe*`,
      ],
      ru_hint: [
        'Точные значения для 30°, 45°, 60° на листе формул lai не даны — выводим их из треугольников и учим.',
        'Синус — противолежащий катет к гипотенузе, косинус — прилежащий к гипотенузе, тангенс — противолежащий к прилежащему.',
        'Угол по значению: кнопки sin⁻¹, cos⁻¹, tan⁻¹, калькулятор в режиме DEG.',
      ],
      example: {
        task: r`Tuleta $\sin30^\circ$, $\cos30^\circ$, $\tan30^\circ$ ja $\sin60^\circ$ täpsed väärtused.`,
        steps: [
          r`Võtame võrdkülgse kolmnurga küljega $2$. Kõrgus jaotab selle kaheks täisnurkseks kolmnurgaks: hüpotenuus $AB=2$, lühem kaatet $BC=1$, nurk $A=30^\circ$, nurk $B=60^\circ$.`,
          r`Pythagorase teoreem: $AC=\sqrt{2^2-1^2}=\sqrt3$.`,
          r`$\sin30^\circ=\dfrac12$, $\;\cos30^\circ=\dfrac{\sqrt3}{2}$, $\;\tan30^\circ=\dfrac1{\sqrt3}=\dfrac{\sqrt3}{3}$, $\;\sin60^\circ=\dfrac{AC}{AB}=\dfrac{\sqrt3}{2}$.`,
          r`Nurga $45^\circ$ väärtused tulevad võrdhaarsest täisnurksest kolmnurgast kaatetitega $1$: hüpotenuus $\sqrt2$, $\sin45^\circ=\dfrac1{\sqrt2}=\dfrac{\sqrt2}2$.`,
        ],
        figure: { kind: 'triangle', caption: 'Pool võrdkülgsest kolmnurgast küljega 2.', names: 'A B C', c: '2', alpha: '30', right: 'C', sideA: 'a = 1', sideB: 'b = √3', sideC: 'c = 2', angleA: 'α = 30°', angleB: '60°' },
      },
      practice: [
        { title: r`Täisnurkses kolmnurgas $ABC$ on $\angle C=90^\circ$, $a=BC=5$ ja $b=AC=12$.`, parts: [
          [r`Leia hüpotenuus $c$.`, 1, '13', r`$c=\sqrt{25+144}=13$`, 1],
          [r`Leia $\sin\alpha$.`, 1, '5/13|0,38', r`$\sin\alpha=\dfrac{a}{c}=\dfrac5{13}$`, 1],
          [r`Leia $\tan\beta$.`, 1, '12/5|2,4', r`Nurga $B$ vastaskaatet on $b$: $\tan\beta=\dfrac{12}{5}$.`, 1],
          [r`Leia $\alpha$ kahe kümnendkohaga.`, 1, '22,62', r`$\tan\alpha=\dfrac5{12}$, $\;\alpha=\tan^{-1}\dfrac5{12}\approx22{,}62^\circ$.`, 1],
        ] },
        { title: 'Arvuta täpselt.', parts: [
          [r`$\sin30^\circ\cdot\cos60^\circ+\tan45^\circ$`, 1, '1,25|5/4', r`$\dfrac12\cdot\dfrac12+1=\dfrac54$`, 1],
          [r`$2\sin60^\circ\cdot\cos30^\circ$`, 1, '1,5|3/2', r`$2\cdot\dfrac{\sqrt3}2\cdot\dfrac{\sqrt3}2=\dfrac32$`, 1],
          [r`$\tan^260^\circ-\tan^230^\circ$`, 2, '8/3|2,67', r`$3-\dfrac13=\dfrac83$`, 2],
        ] },
        { title: 'Leia teravnurk $\\alpha$ (kahe kümnendkohaga).', parts: [
          [r`$\sin\alpha=0{,}6$`, 1, '36,87', r`$\alpha=\sin^{-1}0{,}6\approx36{,}87^\circ$`, 1],
          [r`$\tan\alpha=2$`, 1, '63,43', r`$\alpha=\tan^{-1}2\approx63{,}43^\circ$`, 1],
          [r`$\cos\alpha=\dfrac{\sqrt3}{2}$ (ilma kalkulaatorita)`, 1, '30', r`Täpne väärtus: $\cos30^\circ=\dfrac{\sqrt3}2$, seega $\alpha=30^\circ$.`, 1],
        ] },
        { title: 'Võrdhaarse täisnurkse kolmnurga hüpotenuus on 10 cm.', parts: [
          [r`Leia kaateti pikkus.`, 2, '5√2|5sqrt(2)|5*sqrt(2)|7,07', r`$a=10\sin45^\circ=10\cdot\dfrac{\sqrt2}2=5\sqrt2\approx7{,}07$ cm`, 2],
          [r`Leia pindala.`, 1, '25', r`$S=\dfrac{(5\sqrt2)^2}{2}=\dfrac{50}2=25$ cm²`, 1],
          [r`Selgita selle kolmnurga abil, miks $\tan45^\circ=1$.`, 1, '', r`Kaatetid on võrdsed, seega $\tan45^\circ=\dfrac{a}{a}=1$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`$6$ m pikkune redel toetub vastu seina. Ohutusjuhend nõuab, et redeli ja maapinna vaheline nurk oleks $70^\circ$ kuni $75^\circ$.`,
        figure: { kind: 'triangle', caption: 'Redel AB, sein BC, maapind AC.', names: 'A B C', c: '6', alpha: '70', right: 'C', sideC: 'AB = 6 m', sideA: 'h = ?', angleA: 'α' }, parts: [
        [r`Kui kõrgele ulatub redel, kui nurk maapinnaga on $70^\circ$? Vastus kahe kümnendkohaga.`, 2, '5,64', r`$h=6\sin70^\circ\approx5{,}64$ m`, 2],
        [r`Redeli alumine ots on seinast $1{,}8$ m kaugusel. Leia nurk maapinnaga kahe kümnendkohaga.`, 2, '72,54', r`$\cos\alpha=\dfrac{1{,}8}{6}=0{,}3$, $\;\alpha=\cos^{-1}0{,}3\approx72{,}54^\circ$.`, 2],
        [r`Kas see asend vastab ohutusjuhendile? Kirjuta jah või ei.`, 1, 'jah', r`$70^\circ\le72{,}54^\circ\le75^\circ$ — jah.`, 0],
      ] },
      self: ['Tean siinuse, koosinuse ja tangensi definitsiooni.', 'Tuletan nurkade 30°, 45° ja 60° täpsed väärtused.', 'Leian nurga kalkulaatoriga väärtuse järgi.'],
    },
    {
      title: 'Põhiseosed ja täiendusnurk',
      ru: 'Основные тождества и дополнительный угол',
      course: 'III',
      exam: 'Põhiseoseid kasutatakse laia riigieksami II osa trigonomeetria ülesandes (II-8) avaldiste lihtsustamisel ja samasuste tõestamisel.',
      can: 'Õpilane leiab ühe trigonomeetrilise funktsiooni väärtuse järgi teised, tuletab seose 1 + tan²α = 1/cos²α ja kasutab täiendusnurga valemeid.',
      theory: [
        r`$\sin^2\alpha+\cos^2\alpha=1$ — *valemilehel*`,
        r`$\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}$ — *valemilehel*`,
        r`$1+\tan^2\alpha=\dfrac{1}{\cos^2\alpha}$ (jaga põhiseos $\cos^2\alpha$-ga) — *pähe*`,
        r`Täiendusnurk: $\sin(90^\circ-\alpha)=\cos\alpha$, $\;\cos(90^\circ-\alpha)=\sin\alpha$, $\;\tan(90^\circ-\alpha)=\dfrac1{\tan\alpha}$ — *valemilehel*`,
      ],
      ru_hint: [
        'На листе формул lai есть sin²α + cos²α = 1, tg α = sin α / cos α и формулы приведения; 1 + tg²α = 1/cos²α выводим сами.',
        'Если дан синус острого угла, косинус находим из основного тождества — он положительный.',
        'Синус угла равен косинусу дополнительного угла (до 90°).',
      ],
      example: {
        task: r`Tuleta seos $1+\tan^2\alpha=\dfrac1{\cos^2\alpha}$. Teravnurga $\alpha$ korral $\cos\alpha=0{,}28$; leia $\sin\alpha$ ja $\tan\alpha$ ning kontrolli seost.`,
        steps: [
          r`Jagame $\sin^2\alpha+\cos^2\alpha=1$ pooled $\cos^2\alpha$-ga: $\dfrac{\sin^2\alpha}{\cos^2\alpha}+1=\dfrac1{\cos^2\alpha}$, s.t $1+\tan^2\alpha=\dfrac1{\cos^2\alpha}$.`,
          r`$\sin\alpha=\sqrt{1-0{,}28^2}=\sqrt{0{,}9216}=0{,}96$ (teravnurk, positiivne).`,
          r`$\tan\alpha=\dfrac{0{,}96}{0{,}28}=\dfrac{24}{7}$. Kontroll: $1+\dfrac{576}{49}=\dfrac{625}{49}$ ja $\dfrac1{0{,}0784}=\dfrac{625}{49}$.`,
          r`Joonisel on kolmnurk külgedega $7$, $24$, $25$: $\cos\alpha=\dfrac7{25}=0{,}28$.`,
        ],
        figure: { kind: 'triangle', caption: 'cos α = 7/25 = 0,28', names: 'A B C', a: '24', b: '7', right: 'C', sideA: 'a = 24', sideB: 'b = 7', sideC: 'c = 25', angleA: 'α' },
      },
      practice: [
        { title: r`$\sin\alpha=0{,}8$, $\alpha$ on teravnurk.`, parts: [
          [r`Leia $\cos\alpha$.`, 1, '0,6|3/5', r`$\cos\alpha=\sqrt{1-0{,}64}=\sqrt{0{,}36}=0{,}6$`, 1],
          [r`Leia $\tan\alpha$.`, 1, '4/3|1,33', r`$\dfrac{0{,}8}{0{,}6}=\dfrac43$`, 1],
          [r`Arvuta $1+\tan^2\alpha$.`, 1, '25/9|2,78', r`$1+\dfrac{16}9=\dfrac{25}9$ (kontroll: $\dfrac1{0{,}36}=\dfrac{25}9$).`, 1],
        ] },
        { title: r`$\tan\alpha=2$, $\alpha$ on teravnurk.`, parts: [
          [r`Leia $\cos^2\alpha$.`, 1, '1/5|0,2', r`$\dfrac1{\cos^2\alpha}=1+4=5$, $\;\cos^2\alpha=\dfrac15$.`, 1],
          [r`Leia $\cos\alpha$.`, 1, '√5/5|sqrt(5)/5|0,45', r`$\cos\alpha=\dfrac1{\sqrt5}=\dfrac{\sqrt5}5\approx0{,}45$`, 1],
          [r`Leia $\sin\alpha$.`, 1, '2√5/5|2sqrt(5)/5|0,89', r`$\sin\alpha=\tan\alpha\cdot\cos\alpha=\dfrac{2}{\sqrt5}=\dfrac{2\sqrt5}5\approx0{,}89$`, 1],
        ] },
        { title: 'Lihtsusta.', parts: [
          [r`$\dfrac{1-\cos^2\alpha}{\sin\alpha}$`, 1, 'sinα|sin(α)|sina', r`$\dfrac{\sin^2\alpha}{\sin\alpha}=\sin\alpha$`, 1],
          [r`$\dfrac{\sin(90^\circ-\alpha)}{\cos\alpha}$`, 1, '1', r`$\sin(90^\circ-\alpha)=\cos\alpha$, jagatis on $1$.`, 1],
          [r`$\tan\alpha\cdot\tan(90^\circ-\alpha)$`, 1, '1', r`$\tan\alpha\cdot\dfrac1{\tan\alpha}=1$`, 1],
        ] },
        { title: 'Tõesta või arvuta ilma kalkulaatorita.', parts: [
          [r`Tõesta, et $(\sin\alpha+\cos\alpha)^2=1+2\sin\alpha\cos\alpha$.`, 2, '', r`$(\sin\alpha+\cos\alpha)^2=\sin^2\alpha+2\sin\alpha\cos\alpha+\cos^2\alpha=1+2\sin\alpha\cos\alpha$.`, 2],
          [r`$\sin^220^\circ+\sin^270^\circ$`, 2, '1', r`$\sin70^\circ=\cos20^\circ$: $\sin^220^\circ+\cos^220^\circ=1$.`, 2],
          [r`$\tan10^\circ\cdot\tan20^\circ\cdot\tan70^\circ\cdot\tan80^\circ$`, 2, '1', r`$\tan80^\circ=\dfrac1{\tan10^\circ}$, $\;\tan70^\circ=\dfrac1{\tan20^\circ}$: korrutis on $1$.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`$\cos\alpha=\dfrac5{13}$, kus $\alpha$ on teravnurk.`, parts: [
        [r`Leia $\sin\alpha$.`, 2, '12/13|0,92', r`$\sin\alpha=\sqrt{1-\dfrac{25}{169}}=\sqrt{\dfrac{144}{169}}=\dfrac{12}{13}$ (teravnurk).`, 2],
        [r`Leia $\tan\alpha$.`, 1, '12/5|2,4', r`$\tan\alpha=\dfrac{12/13}{5/13}=\dfrac{12}5$`, 1],
        [r`Arvuta $\dfrac{\sin\alpha-\cos\alpha}{\sin\alpha+\cos\alpha}$.`, 2, '7/17|0,41', r`$\dfrac{\frac{12}{13}-\frac5{13}}{\frac{12}{13}+\frac5{13}}=\dfrac{7}{17}$`, 2],
        [r`Leia $\sin(90^\circ-\alpha)$.`, 1, '5/13|0,38', r`$\sin(90^\circ-\alpha)=\cos\alpha=\dfrac5{13}$`, 1],
        [r`Tõesta, et $\dfrac1{\cos^2\alpha}-\tan^2\alpha=1$ iga teravnurga $\alpha$ korral.`, 2, '', r`$\dfrac1{\cos^2\alpha}-\dfrac{\sin^2\alpha}{\cos^2\alpha}=\dfrac{1-\sin^2\alpha}{\cos^2\alpha}=\dfrac{\cos^2\alpha}{\cos^2\alpha}=1$.`, 3],
        [r`Leia $\alpha$ kahe kümnendkohaga.`, 2, '67,38', r`$\alpha=\cos^{-1}\dfrac5{13}\approx67{,}38^\circ$`, 1],
      ] },
      self: ['Leian siinuse järgi koosinuse ja tangensi.', 'Tuletan seose 1 + tan²α = 1/cos²α.', 'Kasutan täiendusnurga valemeid.'],
    },
    {
      title: 'Täisnurkse kolmnurga lahendamine',
      ru: 'Решение прямоугольного треугольника',
      course: 'III',
      exam: 'Laia riigieksami I-7 ja II-12 ülesandes lahendatakse sageli kaks täisnurkset kolmnurka järjest (kõrgus, vaatenurk, kalle).',
      can: 'Õpilane leiab täisnurkse kolmnurga kõik küljed ja nurgad kahe antud elemendi järgi ning lahendab kahe kolmnurgaga elulise ülesande.',
      theory: [
        r`$a=c\sin\alpha$, $\;b=c\cos\alpha$, $\;a=b\tan\alpha$ (kaks elementi, neist vähemalt üks külg) — *pähe*`,
        r`$\alpha+\beta=90^\circ$, $\;a^2+b^2=c^2$ — *pähe*`,
        r`Pindala $S=\dfrac{ab}2$; kõrgus hüpotenuusile $h=\dfrac{ab}{c}$ — *pähe*`,
        r`Tõusunurk ja langusnurk mõõdetakse horisontaalist; kalle protsentides on $100\cdot\tan\alpha$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет формул прямоугольного треугольника — определения sin, cos, tg знаем наизусть.',
        'Сначала рисунок: отметь прямой угол, данные и искомое.',
        'Если треугольников два, общая сторона связывает их: выражаем её двумя способами.',
      ],
      example: {
        task: r`Punktist $A$ paistab torni tipp $T$ tõusunurga $32^\circ$ all. Kui minna tornile $50$ m lähemale punkti $B$, on tõusunurk $47^\circ$. Leia torni kõrgus.`,
        steps: [
          r`Olgu $F$ torni jalam, $BF=x$ ja $TF=h$. Kolmnurgast $BFT$: $h=x\tan47^\circ$; kolmnurgast $AFT$: $h=(x+50)\tan32^\circ$.`,
          r`$x\tan47^\circ=(x+50)\tan32^\circ$, $\;x=\dfrac{50\tan32^\circ}{\tan47^\circ-\tan32^\circ}\approx69{,}82$ m.`,
          r`$h=69{,}82\cdot\tan47^\circ\approx74{,}87$ m.`,
        ],
        graph: { fns: '', xmin: -10, xmax: 130, ymin: -10, ymax: 90, step: 10, stepY: 10, labelEvery: 2, points: 'A(0; 0)\nB(50; 0)\nF(119.82; 0)\nT(119.82; 74.87)', segments: 'A-T\nB-T\nA-F\nF-T', caption: 'AB = 50 m, nurk A = 32°, nurk B = 47°' },
      },
      practice: [
        { title: r`Täisnurkses kolmnurgas ($\angle C=90^\circ$) on hüpotenuus $c=15$ ja $\alpha=38^\circ$. Vastused kahe kümnendkohaga.`, parts: [
          [r`Leia kaatet $a$.`, 1, '9,23', r`$a=15\sin38^\circ\approx9{,}23$`, 1],
          [r`Leia kaatet $b$.`, 1, '11,82', r`$b=15\cos38^\circ\approx11{,}82$`, 1],
          [r`Leia nurk $\beta$.`, 1, '52', r`$\beta=90^\circ-38^\circ=52^\circ$`, 1],
        ] },
        { title: r`Täisnurkse kolmnurga kaatetid on $a=7$ ja $b=9$. Vastused kahe kümnendkohaga.`, parts: [
          [r`Leia hüpotenuus.`, 1, '11,4|√130|sqrt(130)', r`$c=\sqrt{49+81}=\sqrt{130}\approx11{,}40$`, 1],
          [r`Leia nurk $\alpha$ (kaateti $a$ vastas).`, 1, '37,87', r`$\tan\alpha=\dfrac79$, $\;\alpha\approx37{,}87^\circ$`, 1],
          [r`Leia kõrgus hüpotenuusile.`, 2, '5,53', r`$h=\dfrac{ab}{c}=\dfrac{63}{\sqrt{130}}\approx5{,}53$`, 2],
        ] },
        { title: 'Mööda teed $300$ m sõites tõuseb auto $21$ m kõrgemale. Vastused kahe kümnendkohaga.', parts: [
          [r`Leia tee tõusunurk.`, 2, '4,01', r`$\sin\alpha=\dfrac{21}{300}=0{,}07$, $\;\alpha\approx4{,}01^\circ$`, 2],
          [r`Liiklusmärgil on kalle protsentides ($100\cdot\tan\alpha$). Leia see.`, 2, '7,02', r`Horisontaalne nihe $\sqrt{300^2-21^2}\approx299{,}26$ m; $\;100\cdot\dfrac{21}{299{,}26}\approx7{,}02$ %.`, 3],
        ] },
        { title: 'Rombi diagonaalid on 10 cm ja 24 cm.', parts: [
          [r`Leia rombi külg.`, 1, '13', r`Diagonaalid poolitavad teineteist risti: $\sqrt{5^2+12^2}=13$ cm.`, 1],
          [r`Leia rombi teravnurk kahe kümnendkohaga.`, 2, '45,24', r`Pool teravnurgast: $\tan\varphi=\dfrac5{12}$, $\varphi\approx22{,}62^\circ$; teravnurk $\approx45{,}24^\circ$.`, 2],
          [r`Leia rombi pindala.`, 1, '120', r`$S=\dfrac{10\cdot24}{2}=120$ cm²`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Vaatleja $V$ seisab tasasel maal raadiomasti jalamist $M$ $60$ m kaugusel. Masti tipp $T$ paistab tõusunurga $35^\circ$ all. Vastused kahe kümnendkohaga.`,
        figure: { kind: 'triangle', caption: 'Vaatleja V, masti tipp T ja jalam M.', names: 'V T M', b: '60', alpha: '35', right: 'C', sideB: 'VM = 60 m', sideA: 'h = ?', angleA: '35°' }, parts: [
        [r`Leia masti kõrgus.`, 3, '42,01', r`$h=60\tan35^\circ\approx42{,}01$ m`, 3],
        [r`Mastil on antenn, mille alumine ots paistab vaatlejale tõusunurga $28^\circ$ all, ülemine ots on masti tipus. Leia antenni pikkus.`, 3, '10,11', r`Alumise otsa kõrgus $60\tan28^\circ\approx31{,}90$ m; antenn $60(\tan35^\circ-\tan28^\circ)\approx10{,}11$ m.`, 4],
        [r`Kui kaugel mastist peab vaatleja seisma, et tipp paistaks $20^\circ$ all?`, 2, '115,43', r`$d=\dfrac{h}{\tan20^\circ}=\dfrac{60\tan35^\circ}{\tan20^\circ}\approx115{,}43$ m`, 2],
        [r`Masti tipust on tõmmatud tross maapinnale punkti, mis on jalamist $25$ m kaugusel. Leia trossi pikkus.`, 1, '48,89', r`$\sqrt{h^2+25^2}\approx\sqrt{42{,}01^2+625}\approx48{,}89$ m`, 2],
        [r`Leia trossi ja maapinna vaheline nurk.`, 1, '59,24', r`$\tan\varphi=\dfrac{42{,}01}{25}$, $\;\varphi\approx59{,}24^\circ$`, 1],
      ] },
      self: ['Lahendan täisnurkse kolmnurga kahe elemendi järgi.', 'Tean, mis on tõusunurk ja kalle.', 'Seon kaks kolmnurka ühise külje abil.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: III kursus',
      ru: 'Повторение и контрольная работа: III курс',
      course: 'III',
      exam: 'Kontrolltöö kordab võrratusi ja teravnurga trigonomeetriat samas vormis nagu riigieksam: iga õige samm annab punkti.',
      can: 'Õpilane lahendab III kursuse võrratusi ja täisnurkse kolmnurga ülesandeid iseseisvalt ning kirjutab lahenduskäigu.',
      theory: [
        r`Korrutamisel või jagamisel negatiivse arvuga võrratuse märk pöördub — *pähe*`,
        r`Ruutvõrratus: nullkohad, parabooli skits, vastus jooniselt; $D<0$ ja $a>0$ korral $ax^2+bx+c>0$ iga $x$ korral — *pähe*`,
        r`Murdvõrratus: kõik ühele poole, intervallmeetod; nimetaja nullkoht ei kuulu kunagi lahendisse — *pähe*`,
        r`$|x-a|<r\Leftrightarrow a-r<x<a+r$; süsteem — lahendihulkade ühisosa — *pähe*`,
        r`$\sin^2\alpha+\cos^2\alpha=1$, $\;\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}$ — *valemilehel*`,
        r`Täisnurkses kolmnurgas $\sin\alpha=\dfrac ac$, $\;\cos\alpha=\dfrac bc$, $\;\tan\alpha=\dfrac ab$ — *pähe*`,
      ],
      ru_hint: [
        'Контрольная: 25 баллов, 45 минут. Пиши все шаги — балл дают за каждый верный шаг.',
        'На листе формул lai есть только основное тригонометрическое тождество и tg α = sin α / cos α; всё про неравенства — наизусть.',
        'Ответ неравенства пиши промежутком; проверь, входят ли концы.',
      ],
      example: {
        task: r`Lahenda $\dfrac{x-1}{x+2}\ge0$.`,
        steps: [
          r`Nullkohad: $1$ (lugeja, kuulub) ja $-2$ (nimetaja, ei kuulu).`,
          r`Märgid: $x<-2$: $+$; $\;-2<x<1$: $-$; $\;x>1$: $+$.`,
          r`Vastus: $(-\infty;-2)\cup[1;\infty)$.`,
        ],
      },
      practice: [
        { title: 'Lahenda võrratus.', parts: [
          [r`$-2x+5>1$`, 1, '(-∞;2)|x<2', r`$-2x>-4$, märk pöördub: $x<2$.`, 1],
          [r`$x^2<2x$`, 1, '(0;2)|0<x<2', r`$x(x-2)<0$: $0<x<2$.`, 1],
        ] },
        { title: 'Lahenda võrratus.', parts: [
          [r`$\dfrac{x-1}{x+2}\ge0$`, 2, '(-∞;-2)∪[1;∞)|x<-2;x>=1|x<-2;x≥1', r`Vt näidet: $(-\infty;-2)\cup[1;\infty)$.`, 2],
          [r`$|x-1|<4$`, 2, '(-3;5)|-3<x<5', r`$-4<x-1<4$, $\;-3<x<5$.`, 2],
        ] },
        { title: r`$\sin\alpha=\dfrac5{13}$, $\alpha$ on teravnurk.`, parts: [
          [r`Leia $\cos\alpha$.`, 1, '12/13|0,92', r`$\sqrt{1-\dfrac{25}{169}}=\dfrac{12}{13}$`, 1],
          [r`Leia $\tan\alpha$.`, 1, '5/12|0,42', r`$\dfrac{5/13}{12/13}=\dfrac5{12}$`, 1],
        ] },
        { title: r`Täisnurkses kolmnurgas on hüpotenuus $20$ ja teravnurk $25^\circ$. Vastused kahe kümnendkohaga.`, parts: [
          [r`Leia nurga vastaskaatet.`, 1, '8,45', r`$20\sin25^\circ\approx8{,}45$`, 1],
          [r`Leia nurga lähiskaatet.`, 1, '18,13', r`$20\cos25^\circ\approx18{,}13$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'III kursus: võrratused ja teravnurga trigonomeetria. Aega 45 minutit, kalkulaator kraadides.', parts: [
        [r`1. Lahenda $3(x-2)-\dfrac{x+4}{2}\le1$.`, 2, '(-∞;3,6]|x<=3,6|x≤3,6', r`Korrutame $2$-ga: $6x-12-x-4\le2$, $\;5x\le18$, $\;x\le3{,}6$.`, 2],
        [r`2. Lahenda $-1<\dfrac{3x+1}{2}\le5$.`, 2, '(-1;3]|-1<x<=3|-1<x≤3', r`$-2<3x+1\le10$, $\;-3<3x\le9$, $\;-1<x\le3$.`, 2],
        [r`3. Lahenda $2x^2-3x-2>0$.`, 3, '(-∞;-0,5)∪(2;∞)|x<-0,5;x>2', r`$D=9+16=25$, $x=\dfrac{3\pm5}{4}$: $2$ ja $-0{,}5$; harud üles: $x<-0{,}5$ või $x>2$.`, 3],
        [r`4. Leia $p$ väärtused, mille korral $x^2-px+4>0$ iga $x$ korral.`, 3, '(-4;4)|-4<p<4', r`Vaja $D=p^2-16<0$: $-4<p<4$.`, 3],
        [r`5. Lahenda $\dfrac{2x-1}{x+3}\ge1$.`, 3, '(-∞;-3)∪[4;∞)|x<-3;x>=4|x<-3;x≥4', r`$\dfrac{2x-1-(x+3)}{x+3}\ge0$, $\;\dfrac{x-4}{x+3}\ge0$: $x<-3$ või $x\ge4$.`, 3],
        [r`6. Lahenda süsteem $\begin{cases}x^2-9\le0\\|x-1|>1\end{cases}$`, 3, '[-3;0)∪(2;3]|-3<=x<0;2<x<=3|-3≤x<0;2<x≤3', r`Esimene: $-3\le x\le3$. Teine: $x<0$ või $x>2$. Ühisosa: $[-3;0)\cup(2;3]$.`, 3],
        [r`7. $\cos\alpha=0{,}6$, $\alpha$ on teravnurk. Leia $\sin\alpha$ ja $\tan\alpha$.`, 2, '0,8; 4/3|0,8; 1,33', r`$\sin\alpha=\sqrt{1-0{,}36}=0{,}8$, $\;\tan\alpha=\dfrac{0{,}8}{0{,}6}=\dfrac43$.`, 2],
        [r`8. Tõesta, et $1+\tan^2\alpha=\dfrac1{\cos^2\alpha}$.`, 2, '', r`$1+\dfrac{\sin^2\alpha}{\cos^2\alpha}=\dfrac{\cos^2\alpha+\sin^2\alpha}{\cos^2\alpha}=\dfrac1{\cos^2\alpha}$.`, 2],
        [r`9. Suusaraja pikkus on $450$ m ja kõrguste vahe $120$ m. Leia raja kaldenurk kahe kümnendkohaga.`, 2, '15,47', r`$\sin\alpha=\dfrac{120}{450}$, $\;\alpha\approx15{,}47^\circ$`, 2],
        [r`10. Leia sama raja alguse ja lõpu horisontaalne kaugus kahe kümnendkohaga.`, 3, '433,7|433,70', r`$\sqrt{450^2-120^2}=\sqrt{188\,100}\approx433{,}70$ m`, 2],
      ] },
      self: ['Oskan III kursuse kõiki ülesandetüüpe.', 'Kirjutan iga sammu.', 'Kontrollin, kas vahemiku otspunktid kuuluvad vastusesse.'],
    },

    // ───────────── IV kursus „Trigonomeetria II” ─────────────
    {
      title: 'Radiaanmõõt, kaar ja sektor',
      ru: 'Радианная мера, дуга и сектор',
      course: 'IV',
      exam: 'Laia riigieksami trigonomeetria (II osa) on radiaanides; kaar ja sektor tulevad ette ringi ja pöördkeha ülesannetes.',
      can: 'Õpilane teisendab kraadid radiaanideks ja vastupidi ning arvutab kaare pikkuse ja sektori pindala.',
      theory: [
        r`$180^\circ=\pi$ rad; $\;1$ rad $\approx57{,}3^\circ$ (nurk, mille kaar on raadiuse pikkune) — *pähe*`,
        r`$\alpha_{\text{rad}}=\dfrac{\pi}{180^\circ}\cdot\alpha^\circ$, $\;\alpha^\circ=\dfrac{180^\circ}{\pi}\cdot\alpha_{\text{rad}}$; $\;30^\circ=\frac\pi6$, $45^\circ=\frac\pi4$, $60^\circ=\frac\pi3$, $90^\circ=\frac\pi2$ — *pähe*`,
        r`Kaar on ringjoone osa: $l=r\alpha$ ($\alpha$ radiaanides) ehk $l=\dfrac{\pi r\alpha^\circ}{180^\circ}$ — *pähe*`,
        r`Sektor on ringi osa: $S=\dfrac{r^2\alpha}{2}=\dfrac{rl}{2}$ ($\alpha$ radiaanides) ehk $S=\dfrac{\pi r^2\alpha^\circ}{360^\circ}$ — *pähe*`,
      ],
      ru_hint: [
        'π радиан = 180°. Градусы → радианы: умножаем на π/180; радианы → градусы: на 180/π.',
        'Формул дуги и сектора нет на листе формул lai — помним, что дуга — часть окружности 2πr, сектор — часть круга πr².',
        'Перед расчётом проверь режим калькулятора: DEG или RAD.',
      ],
      example: {
        task: r`Ringi raadius on $6$ cm ja sektori kesknurk on $120^\circ$. Leia kesknurk radiaanides, kaare pikkus ja sektori pindala.`,
        steps: [
          r`$\alpha=120^\circ\cdot\dfrac{\pi}{180^\circ}=\dfrac{2\pi}{3}$ rad.`,
          r`$l=r\alpha=6\cdot\dfrac{2\pi}{3}=4\pi\approx12{,}57$ cm.`,
          r`$S=\dfrac{r^2\alpha}{2}=\dfrac{36}{2}\cdot\dfrac{2\pi}{3}=12\pi\approx37{,}70$ cm².`,
          r`Kontroll: sektor on $\dfrac{120}{360}=\dfrac13$ ringist: $\dfrac{36\pi}{3}=12\pi$.`,
        ],
        figure: { kind: 'circle', caption: 'Sektor kesknurgaga $120^\\circ$.', names: 'O A B', central: 120, radius: 'r = 6', angle: 'α = 120°', sector: true },
      },
      practice: [
        { title: 'Teisenda radiaanideks (täpselt või kahe kümnendkohaga).', parts: [
          [r`$135^\circ$`, 1, '3π/4|3pi/4|2,36', r`$135\cdot\dfrac{\pi}{180}=\dfrac{3\pi}{4}\approx2{,}36$`, 1],
          [r`$210^\circ$`, 1, '7π/6|7pi/6|3,67', r`$210\cdot\dfrac{\pi}{180}=\dfrac{7\pi}{6}\approx3{,}67$`, 1],
          [r`$18^\circ$`, 1, 'π/10|pi/10|0,31', r`$18\cdot\dfrac{\pi}{180}=\dfrac{\pi}{10}\approx0{,}31$`, 1],
        ] },
        { title: 'Teisenda kraadideks.', parts: [
          [r`$\dfrac{5\pi}{12}$`, 1, '75', r`$\dfrac{5\cdot180^\circ}{12}=75^\circ$`, 1],
          [r`$1{,}2$ rad (kahe kümnendkohaga)`, 1, '68,75', r`$1{,}2\cdot\dfrac{180^\circ}{\pi}\approx68{,}75^\circ$`, 1],
          [r`$3\pi$`, 1, '540', r`$3\cdot180^\circ=540^\circ$`, 1],
        ] },
        { title: 'Ringi raadius on 10 cm ja kaare pikkus on 15 cm.', parts: [
          ['Leia kesknurk radiaanides.', 1, '1,5', r`$\alpha=\dfrac lr=\dfrac{15}{10}=1{,}5$ rad`, 1],
          ['Leia kesknurk kraadides kahe kümnendkohaga.', 1, '85,94', r`$1{,}5\cdot\dfrac{180^\circ}{\pi}\approx85{,}94^\circ$`, 1],
          ['Leia sektori pindala (cm²).', 2, '75', r`$S=\dfrac{rl}{2}=\dfrac{10\cdot15}{2}=75$ cm²`, 2],
        ] },
        { title: 'Kella minutiosuti on 12 cm pikk. Vaatleme 20 minutit.', parts: [
          ['Mitu radiaani pöördub osuti?', 1, '2π/3|2pi/3|2,09', r`20 minutit on $\dfrac13$ täispöördest: $\dfrac{2\pi}{3}\approx2{,}09$ rad.`, 1],
          ['Kui pika tee läbib osuti tipp (cm)?', 2, '8π|8pi|25,13', r`$l=12\cdot\dfrac{2\pi}{3}=8\pi\approx25{,}13$ cm`, 2],
          ['Kui suure pindala katab osuti (cm²)?', 2, '48π|48pi|150,80', r`$S=\dfrac{144}{2}\cdot\dfrac{2\pi}{3}=48\pi\approx150{,}80$ cm²`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Ringikujulise lillepeenra raadius on $4$ m. Peenra sektorisse kesknurgaga $1{,}2$ rad istutatakse roosid. Sektori kõõlu äärde pannakse madal piire.`,
        figure: { kind: 'circle', caption: 'Peenar: sektor $AOB$, kesknurk $1{,}2$ rad.', names: 'O A B', central: 68.75, radius: 'r = 4 m', angle: '1,2 rad', chord: true, sector: true },
        parts: [
          ['Leia rooside sektori pindala (m²).', 2, '9,6', r`$S=\dfrac{r^2\alpha}{2}=\dfrac{16\cdot1{,}2}{2}=9{,}6$ m²`, 2],
          ['Leia sektori kaare pikkus (m).', 1, '4,8', r`$l=r\alpha=4\cdot1{,}2=4{,}8$ m`, 1],
          ['Leia kõõlu $AB$ pikkus kahe kümnendkohaga.', 2, '4,52', r`Võrdhaarses kolmnurgas $AOB$: $AB=2r\sin\dfrac\alpha2=8\sin0{,}6\approx4{,}52$ m (kalkulaator RAD).`, 3],
          ['Leia kaare ja kõõlu vahelise segmendi pindala kahe kümnendkohaga.', 3, '2,14', r`$S_{AOB}=\dfrac12r^2\sin\alpha=8\sin1{,}2\approx7{,}46$ m²; segment $9{,}6-7{,}46\approx2{,}14$ m².`, 3],
          ['Segment piiratakse kaare ja kõõlu kaudu aiaga. Kui pikk on aed?', 2, '9,32', r`$4{,}8+4{,}52\approx9{,}32$ m`, 2],
        ] },
      self: ['Teisendan kraadid radiaanideks ja tagasi.', 'Arvutan kaare pikkuse ja sektori pindala.', 'Kontrollin kalkulaatori režiimi.'],
    },
    {
      title: 'Mis tahes nurga trigonomeetrilised funktsioonid',
      ru: 'Тригонометрические функции любого угла',
      course: 'IV',
      exam: 'Laia riigieksami II osa trigonomeetriaülesandes tuleb leida nurga väärtused etteantud lõigul ja teada märke veerandites.',
      can: 'Õpilane defineerib mis tahes nurga siinuse, koosinuse ja tangensi ühikringjoonel ning leiab kõik nurgad lõigul [0°; 360°], millel on antud väärtus.',
      theory: [
        r`Ühikringjoonel on nurga $\alpha$ lõpphaara punkt $P(\cos\alpha;\,\sin\alpha)$; punktist $P(x;y)$, $r=\sqrt{x^2+y^2}$: $\sin\alpha=\dfrac yr$, $\cos\alpha=\dfrac xr$, $\tan\alpha=\dfrac yx$ — *pähe*`,
        r`Märgid: I veerand kõik $+$; II — $\sin+$; III — $\tan+$; IV — $\cos+$; $\;-1\le\sin\alpha\le1$, $\;-1\le\cos\alpha\le1$ — *pähe*`,
        r`$\sin^2\alpha+\cos^2\alpha=1$, $\;\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}$ — *valemilehel*`,
        r`$1+\tan^2\alpha=\dfrac{1}{\cos^2\alpha}$ (jagame põhiseose $\cos^2\alpha$-ga) — *pähe*`,
        r`Nurk väärtuse järgi lõigul $[0^\circ;360^\circ]$: $\sin\alpha=a$: $\alpha_1=\sin^{-1}a$, $\alpha_2=180^\circ-\alpha_1$; $\;\cos\alpha=a$: $\alpha_2=360^\circ-\alpha_1$; $\;\tan\alpha=a$: $\alpha_2=\alpha_1+180^\circ$ (negatiivse $\alpha_1$ korral liida $360^\circ$) — *pähe*`,
      ],
      ru_hint: [
        'На единичной окружности косинус — это x, синус — это y точки P.',
        'На листе формул lai есть sin²α + cos²α = 1 и tan α = sin α / cos α; знаки по четвертям и 1 + tan²α = 1/cos²α — наизусть.',
        'Калькулятор (sin⁻¹) даёт только один угол — второй ищем по единичной окружности.',
      ],
      example: {
        task: r`Leia kõik nurgad $\alpha\in[0^\circ;360^\circ]$, mille korral $\sin\alpha=-0{,}6$.`,
        steps: [
          r`Kalkulaator: $\sin^{-1}(-0{,}6)\approx-36{,}87^\circ$ — see nurk ei ole lõigul.`,
          r`Siinus on negatiivne III ja IV veerandis. Sirge $y=-0{,}6$ lõikab ühikringjoont punktides $A$ ja $B$.`,
          r`III veerand: $\alpha=180^\circ+36{,}87^\circ=216{,}87^\circ$; IV veerand: $\alpha=360^\circ-36{,}87^\circ=323{,}13^\circ$.`,
          r`Vastus: $216{,}87^\circ$ ja $323{,}13^\circ$.`,
        ],
        graph: { fns: 'y = sqrt(1 - x^2)\ny = -sqrt(1 - x^2)\ny = -0.6', xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, step: 0.5, stepY: 0.5, labelEvery: 2, points: 'O(0; 0)\nA(-0.8; -0.6)\nB(0.8; -0.6)', segments: 'O-A\nO-B', caption: 'ühikringjoon ja sirge y = −0,6' },
      },
      practice: [
        { title: r`Punkt $P(5;-12)$ asub nurga $\alpha$ lõpphaaral.`, parts: [
          [r`Leia $\sin\alpha$.`, 1, '-12/13|-0,92', r`$r=\sqrt{25+144}=13$; $\sin\alpha=-\dfrac{12}{13}\approx-0{,}92$`, 1],
          [r`Leia $\cos\alpha$.`, 1, '5/13|0,38', r`$\cos\alpha=\dfrac{5}{13}\approx0{,}38$`, 1],
          [r`Leia $\tan\alpha$.`, 1, '-2,4|-12/5', r`$\tan\alpha=\dfrac{-12}{5}=-2{,}4$`, 1],
        ] },
        { title: r`Leia kõik nurgad $\alpha\in[0^\circ;360^\circ]$ (kahe kümnendkohaga).`, parts: [
          [r`$\cos\alpha=0{,}4$`, 2, '66,42; 293,58', r`$\cos^{-1}0{,}4\approx66{,}42^\circ$; IV veerandis $360^\circ-66{,}42^\circ=293{,}58^\circ$.`],
          [r`$\tan\alpha=-2$`, 2, '116,57; 296,57', r`$\tan^{-1}(-2)\approx-63{,}43^\circ$; $-63{,}43^\circ+180^\circ=116{,}57^\circ$, $\;-63{,}43^\circ+360^\circ=296{,}57^\circ$.`],
          [r`$\sin\alpha=0{,}5$`, 1, '30; 150', r`$\sin^{-1}0{,}5=30^\circ$; II veerandis $180^\circ-30^\circ=150^\circ$.`, 1],
        ] },
        { title: r`On teada, et $\sin\alpha=\dfrac{5}{13}$ ja $90^\circ<\alpha<180^\circ$.`, parts: [
          [r`Leia $\cos\alpha$.`, 2, '-12/13|-0,92', r`$\cos^2\alpha=1-\dfrac{25}{169}=\dfrac{144}{169}$; II veerandis $\cos\alpha<0$: $\cos\alpha=-\dfrac{12}{13}$.`],
          [r`Leia $\tan\alpha$.`, 1, '-5/12|-0,42', r`$\tan\alpha=\dfrac{5/13}{-12/13}=-\dfrac{5}{12}$`, 1],
        ] },
        { title: 'Põhiseosed.', parts: [
          [r`Kas võib olla $\sin\alpha=0{,}6$ ja $\cos\alpha=0{,}7$? Kirjuta jah või ei.`, 1, 'ei', r`$0{,}36+0{,}49=0{,}85\ne1$, seega mitte.`, 1],
          [r`Arvuta $\sin^2\alpha+\cos^2\alpha+\tan\alpha\cdot\cos\alpha$, kui $\sin\alpha=0{,}3$.`, 2, '1,3', r`$1+\dfrac{\sin\alpha}{\cos\alpha}\cdot\cos\alpha=1+\sin\alpha=1{,}3$`],
          [r`Tõesta, et $1+\tan^2\alpha=\dfrac1{\cos^2\alpha}$.`, 2, '', r`$1+\dfrac{\sin^2\alpha}{\cos^2\alpha}=\dfrac{\cos^2\alpha+\sin^2\alpha}{\cos^2\alpha}=\dfrac{1}{\cos^2\alpha}$`, 3],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`On teada, et $\tan\alpha=-\dfrac34$ ja $270^\circ<\alpha<360^\circ$.`, parts: [
        [r`Leia $\cos\alpha$.`, 3, '0,8|4/5', r`$\dfrac1{\cos^2\alpha}=1+\dfrac9{16}=\dfrac{25}{16}$, $\cos^2\alpha=\dfrac{16}{25}$; IV veerandis $\cos\alpha>0$: $\cos\alpha=0{,}8$.`, 3],
        [r`Leia $\sin\alpha$.`, 2, '-0,6|-3/5', r`$\sin\alpha=\tan\alpha\cdot\cos\alpha=-\dfrac34\cdot0{,}8=-0{,}6$`, 2],
        [r`Leia $\alpha$ kahe kümnendkohaga.`, 2, '323,13', r`$\tan^{-1}\dfrac34\approx36{,}87^\circ$; IV veerandis $\alpha=360^\circ-36{,}87^\circ=323{,}13^\circ$.`, 2],
        [r`Arvuta $\dfrac{2\sin\alpha-\cos\alpha}{\sin\alpha+3\cos\alpha}$.`, 3, '-10/9|-1,11', r`Jagame lugeja ja nimetaja $\cos\alpha$-ga: $\dfrac{2\tan\alpha-1}{\tan\alpha+3}=\dfrac{-1{,}5-1}{2{,}25}=-\dfrac{10}{9}$`, 3],
      ] },
      self: ['Tean siinuse, koosinuse ja tangensi märki igas veerandis.', 'Leian ühest väärtusest teised põhiseoste abil.', 'Leian lõigul [0°; 360°] kõik nurgad antud väärtusega.'],
    },
    {
      title: 'Täpsed väärtused ja taandamisvalemid',
      ru: 'Точные значения и формулы приведения',
      course: 'IV',
      exam: 'Laia riigieksami trigonomeetriaülesannetes arvutatakse täpseid väärtusi ilma kalkulaatorita; taandamisvalemid on valemilehel.',
      can: 'Õpilane tuletab nurkade 0°, 30°, 45°, 60°, 90° täpsed väärtused ja taandab mis tahes nurga (ka negatiivse ja täispöördest suurema) teravnurgale.',
      theory: [
        r`$\sin30^\circ=\frac12$, $\cos30^\circ=\frac{\sqrt3}2$, $\tan30^\circ=\frac{\sqrt3}3$; $\;\sin45^\circ=\cos45^\circ=\frac{\sqrt2}2$, $\tan45^\circ=1$; $\;\sin60^\circ=\frac{\sqrt3}2$, $\cos60^\circ=\frac12$, $\tan60^\circ=\sqrt3$ — *pähe*`,
        r`$0^\circ,90^\circ,180^\circ,270^\circ$: punktid $(1;0)$, $(0;1)$, $(-1;0)$, $(0;-1)$ ühikringjoonel — *pähe*`,
        r`Taandamisvalemid, nt $\sin(180^\circ-\alpha)=\sin\alpha$, $\cos(180^\circ+\alpha)=-\cos\alpha$, $\sin(90^\circ+\alpha)=\cos\alpha$, $\cos(\pi-\alpha)=-\cos\alpha$ — *valemilehel*`,
        r`Paarsus: $\sin(-\alpha)=-\sin\alpha$, $\cos(-\alpha)=\cos\alpha$, $\tan(-\alpha)=-\tan\alpha$ — *valemilehel*`,
        r`Perioodilisus: $\sin(\alpha+n\cdot360^\circ)=\sin\alpha$, $\cos(\alpha+n\cdot360^\circ)=\cos\alpha$, $\tan(\alpha+n\cdot180^\circ)=\tan\alpha$ — *valemilehel*`,
      ],
      ru_hint: [
        'Формулы приведения, чётность и периодичность есть на листе формул lai, а точные значения 30°, 45°, 60° учим наизусть.',
        'Сначала убираем полные обороты (360°), потом минус перед углом, потом приводим к острому углу.',
        'Знак ставим по четверти исходного угла.',
      ],
      example: {
        task: r`Tuleta $\sin30^\circ$, $\cos30^\circ$ ja arvuta täpselt $\sin750^\circ+\cos(-120^\circ)+\tan495^\circ$.`,
        steps: [
          r`Võrdkülgse kolmnurga (külg $2$) pool on täisnurkne kolmnurk: hüpotenuus $2$, kaatetid $1$ ja $\sqrt{4-1}=\sqrt3$. Seega $\sin30^\circ=\frac12$, $\cos30^\circ=\frac{\sqrt3}2$.`,
          r`$\sin750^\circ=\sin(30^\circ+2\cdot360^\circ)=\sin30^\circ=\frac12$.`,
          r`$\cos(-120^\circ)=\cos120^\circ=\cos(180^\circ-60^\circ)=-\cos60^\circ=-\frac12$.`,
          r`$\tan495^\circ=\tan(495^\circ-360^\circ)=\tan135^\circ=-\tan45^\circ=-1$.`,
          r`Summa: $\frac12-\frac12-1=-1$.`,
        ],
        figure: { kind: 'triangle', caption: 'Pool võrdkülgsest kolmnurgast: $30^\\circ$ ja $60^\\circ$.', names: 'A B C', c: '2', alpha: '30', right: 'C', sideC: 'c = 2', sideA: 'a = 1', sideB: 'b = √3', angleA: '30°', angleB: '60°' },
      },
      practice: [
        { title: 'Leia täpne väärtus.', parts: [
          [r`$\sin240^\circ$`, 1, '-√3/2|-sqrt(3)/2|-0,87', r`$\sin(180^\circ+60^\circ)=-\sin60^\circ=-\frac{\sqrt3}2$`, 1],
          [r`$\cos315^\circ$`, 1, '√2/2|sqrt(2)/2|0,71', r`$\cos(360^\circ-45^\circ)=\cos45^\circ=\frac{\sqrt2}2$`, 1],
          [r`$\tan300^\circ$`, 1, '-√3|-sqrt(3)|-1,73', r`$\tan(360^\circ-60^\circ)=-\tan60^\circ=-\sqrt3$`, 1],
          [r`$\sin(-150^\circ)$`, 1, '-1/2|-0,5', r`$-\sin150^\circ=-\sin30^\circ=-\frac12$`, 1],
        ] },
        { title: 'Eemalda täispöörded ja leia täpne väärtus.', parts: [
          [r`$\cos1140^\circ$`, 1, '1/2|0,5', r`$1140^\circ=3\cdot360^\circ+60^\circ$: $\cos60^\circ=\frac12$`, 1],
          [r`$\sin(-405^\circ)$`, 1, '-√2/2|-sqrt(2)/2|-0,71', r`$-\sin405^\circ=-\sin45^\circ=-\frac{\sqrt2}2$`, 1],
          [r`$\tan1200^\circ$`, 2, '-√3|-sqrt(3)|-1,73', r`$1200^\circ=6\cdot180^\circ+120^\circ$: $\tan120^\circ=-\tan60^\circ=-\sqrt3$`],
        ] },
        { title: 'Radiaanides.', parts: [
          [r`$\sin\dfrac{5\pi}{6}$`, 1, '1/2|0,5', r`$\sin\left(\pi-\frac\pi6\right)=\sin\frac\pi6=\frac12$`, 1],
          [r`$\cos\dfrac{4\pi}{3}$`, 1, '-1/2|-0,5', r`$\cos\left(\pi+\frac\pi3\right)=-\cos\frac\pi3=-\frac12$`, 1],
          [r`$\tan\dfrac{7\pi}{4}$`, 1, '-1', r`$\tan\left(2\pi-\frac\pi4\right)=-\tan\frac\pi4=-1$`, 1],
        ] },
        { title: 'Lihtsusta.', parts: [
          [r`$\sin(180^\circ-\alpha)+\cos(90^\circ+\alpha)$`, 2, '0', r`$\sin\alpha+(-\sin\alpha)=0$`],
          [r`$\cos(\pi-\alpha)\cos(-\alpha)+\sin(\pi+\alpha)\sin\alpha$`, 2, '-1', r`$-\cos\alpha\cdot\cos\alpha-\sin\alpha\cdot\sin\alpha=-(\cos^2\alpha+\sin^2\alpha)=-1$`],
          [r`$\dfrac{\sin(90^\circ+\alpha)}{\cos(360^\circ-\alpha)}$`, 1, '1', r`$\dfrac{\cos\alpha}{\cos\alpha}=1$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Arvuta ilma kalkulaatorita avaldise $A=\dfrac{\sin120^\circ\cdot\cos330^\circ-\tan225^\circ}{\cos240^\circ}$ täpne väärtus.`, parts: [
        [r`Leia $\sin120^\circ\cdot\cos330^\circ$.`, 2, '3/4|0,75', r`$\sin120^\circ=\sin60^\circ=\frac{\sqrt3}2$, $\cos330^\circ=\cos30^\circ=\frac{\sqrt3}2$; korrutis $\frac34$.`, 3],
        [r`Leia $A$.`, 3, '1/2|0,5', r`$\tan225^\circ=\tan45^\circ=1$, $\cos240^\circ=-\cos60^\circ=-\frac12$: $A=\dfrac{\frac34-1}{-\frac12}=\dfrac{-\frac14}{-\frac12}=\frac12$`, 3],
      ] },
      self: ['Tuletan 30°, 45° ja 60° täpsed väärtused.', 'Eemaldan täispöörded ja miinusmärgi.', 'Kasutan valemilehe taandamisvalemeid.'],
    },
    {
      title: 'Kahe nurga summa ja vahe valemid',
      ru: 'Формулы синуса, косинуса и тангенса суммы и разности',
      course: 'IV',
      exam: 'Laia riigieksami II osa trigonomeetriaülesandes tuleb summa valemitega näidata samasust või arvutada täpne väärtus.',
      can: 'Õpilane tuletab koosinuse vahe valemi, rakendab summa ja vahe valemeid ning arvutab täpseid väärtusi.',
      theory: [
        r`$\cos(\alpha\pm\beta)=\cos\alpha\cos\beta\mp\sin\alpha\sin\beta$ — *valemilehel*`,
        r`$\sin(\alpha\pm\beta)=\sin\alpha\cos\beta\pm\cos\alpha\sin\beta$ — *valemilehel*`,
        r`$\tan(\alpha\pm\beta)=\dfrac{\tan\alpha\pm\tan\beta}{1\mp\tan\alpha\tan\beta}$ — *valemilehel*`,
        r`Tuletus: ühikvektorid $\vec a=(\cos\alpha;\sin\alpha)$, $\vec b=(\cos\beta;\sin\beta)$; $\vec a\cdot\vec b=|\vec a||\vec b|\cos(\alpha-\beta)=\cos\alpha\cos\beta+\sin\alpha\sin\beta$ — *pähe*`,
      ],
      ru_hint: [
        'Все формулы суммы и разности есть на листе формул lai — учим не их, а как ими пользоваться и как их вывести.',
        'Угол 15° = 45° − 30°, 75° = 45° + 30°, 105° = 60° + 45°.',
        'Если дан синус, косинус находим из sin² + cos² = 1 и ставим знак по четверти.',
      ],
      example: {
        task: r`Tuleta valem $\cos(\alpha-\beta)$ ja leia $\cos15^\circ$ täpselt.`,
        steps: [
          r`Ühikringjoonel $A(\cos\alpha;\sin\alpha)$, $B(\cos\beta;\sin\beta)$; vektorite $\overrightarrow{OA}$ ja $\overrightarrow{OB}$ vaheline nurk on $\alpha-\beta$ ja pikkused $1$.`,
          r`Skalaarkorrutis kahel viisil: $\overrightarrow{OA}\cdot\overrightarrow{OB}=1\cdot1\cdot\cos(\alpha-\beta)$ ja $=\cos\alpha\cos\beta+\sin\alpha\sin\beta$.`,
          r`Seega $\cos(\alpha-\beta)=\cos\alpha\cos\beta+\sin\alpha\sin\beta$ (joonisel $\alpha=60^\circ$, $\beta=20^\circ$).`,
          r`$\cos15^\circ=\cos(45^\circ-30^\circ)=\frac{\sqrt2}2\cdot\frac{\sqrt3}2+\frac{\sqrt2}2\cdot\frac12=\dfrac{\sqrt6+\sqrt2}{4}\approx0{,}97$.`,
        ],
        graph: { fns: 'y = sqrt(1 - x^2)\ny = -sqrt(1 - x^2)', xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, step: 0.5, stepY: 0.5, labelEvery: 2, points: 'O(0; 0)\nA(0.5; 0.87)\nB(0.94; 0.34)', segments: 'O-A\nO-B', caption: 'ühikvektorid OA (60°) ja OB (20°)' },
      },
      practice: [
        { title: 'Leia täpne väärtus.', parts: [
          [r`$\sin75^\circ$`, 2, '(√6+√2)/4|(sqrt(6)+sqrt(2))/4|0,97', r`$\sin(45^\circ+30^\circ)=\frac{\sqrt2}2\cdot\frac{\sqrt3}2+\frac{\sqrt2}2\cdot\frac12=\dfrac{\sqrt6+\sqrt2}4$`],
          [r`$\cos105^\circ$`, 2, '(√2-√6)/4|(sqrt(2)-sqrt(6))/4|-0,26', r`$\cos(60^\circ+45^\circ)=\frac12\cdot\frac{\sqrt2}2-\frac{\sqrt3}2\cdot\frac{\sqrt2}2=\dfrac{\sqrt2-\sqrt6}4$`],
          [r`$\tan105^\circ$`, 2, '-2-√3|-2-sqrt(3)|-3,73', r`$\dfrac{\sqrt3+1}{1-\sqrt3}=\dfrac{(\sqrt3+1)^2}{1-3}=\dfrac{4+2\sqrt3}{-2}=-2-\sqrt3$`, 4],
        ] },
        { title: r`$\sin\alpha=0{,}6$ ($0^\circ<\alpha<90^\circ$) ja $\cos\beta=\dfrac5{13}$ ($270^\circ<\beta<360^\circ$).`, parts: [
          [r`Leia $\sin(\alpha+\beta)$.`, 2, '-33/65|-0,51', r`$\cos\alpha=0{,}8$, $\sin\beta=-\frac{12}{13}$. $\;0{,}6\cdot\frac5{13}+0{,}8\cdot\left(-\frac{12}{13}\right)=\dfrac{3-9{,}6}{13}=-\dfrac{33}{65}$`],
          [r`Leia $\cos(\alpha-\beta)$.`, 2, '-16/65|-0,25', r`$0{,}8\cdot\frac5{13}+0{,}6\cdot\left(-\frac{12}{13}\right)=\dfrac{4-7{,}2}{13}=-\dfrac{16}{65}$`],
          [r`Leia $\tan(\alpha+\beta)$.`, 2, '-33/56|-0,59', r`$\tan\alpha=\frac34$, $\tan\beta=-\frac{12}5$: $\dfrac{\frac34-\frac{12}5}{1+\frac34\cdot\frac{12}5}=\dfrac{-\frac{33}{20}}{\frac{56}{20}}=-\dfrac{33}{56}$`],
        ] },
        { title: 'Lihtsusta või arvuta täpselt.', parts: [
          [r`$\sin(\alpha+30^\circ)-\sin(\alpha-30^\circ)$`, 2, 'cosα|cos(α)|cosa|cos(a)', r`$2\cos\alpha\sin30^\circ=\cos\alpha$`],
          [r`$\cos70^\circ\cos10^\circ+\sin70^\circ\sin10^\circ$`, 1, '1/2|0,5', r`$\cos(70^\circ-10^\circ)=\cos60^\circ=\frac12$`, 1],
          [r`$\sin50^\circ\cos20^\circ-\cos50^\circ\sin20^\circ$`, 1, '1/2|0,5', r`$\sin(50^\circ-20^\circ)=\sin30^\circ=\frac12$`, 1],
          [r`$\dfrac{\tan25^\circ+\tan20^\circ}{1-\tan25^\circ\tan20^\circ}$`, 1, '1', r`$\tan(25^\circ+20^\circ)=\tan45^\circ=1$`, 1],
        ] },
        { title: 'Samasus.', parts: [
          [r`Tõesta, et $\sin(\alpha+\beta)\sin(\alpha-\beta)=\sin^2\alpha-\sin^2\beta$.`, 3, '', r`Korrutis $=\sin^2\alpha\cos^2\beta-\cos^2\alpha\sin^2\beta=\sin^2\alpha(1-\sin^2\beta)-(1-\sin^2\alpha)\sin^2\beta=\sin^2\alpha-\sin^2\beta$`, 4],
          [r`Kontrolli samasust, kui $\alpha=60^\circ$, $\beta=30^\circ$: arvuta vasak pool.`, 1, '1/2|0,5', r`$\sin90^\circ\cdot\sin30^\circ=\frac12$; parem pool $\frac34-\frac14=\frac12$.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`$\alpha$ ja $\beta$ on teravnurgad, $\tan\alpha=\dfrac12$ ja $\tan\beta=\dfrac13$.`, parts: [
        [r`Leia $\tan(\alpha+\beta)$.`, 3, '1', r`$\dfrac{\frac12+\frac13}{1-\frac16}=\dfrac{\frac56}{\frac56}=1$`, 3],
        [r`Leia $\alpha+\beta$ kraadides.`, 2, '45', r`$0^\circ<\alpha+\beta<180^\circ$ ja $\tan(\alpha+\beta)=1>0$, seega $\alpha+\beta=45^\circ$.`, 2],
        [r`Leia $\sin\alpha$ täpselt.`, 2, '√5/5|1/√5|sqrt(5)/5|0,45', r`$1+\tan^2\alpha=\frac54=\dfrac1{\cos^2\alpha}$, $\cos\alpha=\dfrac2{\sqrt5}$, $\sin\alpha=\tan\alpha\cos\alpha=\dfrac1{\sqrt5}=\dfrac{\sqrt5}5$`, 2],
        [r`Leia $\cos(\alpha-\beta)$ täpselt.`, 3, '7√2/10|7sqrt(2)/10|0,99', r`$\cos\beta=\dfrac3{\sqrt{10}}$, $\sin\beta=\dfrac1{\sqrt{10}}$. $\;\dfrac2{\sqrt5}\cdot\dfrac3{\sqrt{10}}+\dfrac1{\sqrt5}\cdot\dfrac1{\sqrt{10}}=\dfrac7{\sqrt{50}}=\dfrac{7\sqrt2}{10}$`, 4],
      ] },
      self: ['Tuletan koosinuse vahe valemi skalaarkorrutisega.', 'Arvutan sin 75°, cos 15° jms täpselt.', 'Panen märgi veerandi järgi.'],
    },
    {
      title: 'Kahekordse nurga valemid ja trigonomeetrilised samasused',
      ru: 'Формулы двойного угла и тригонометрические тождества',
      course: 'IV',
      exam: 'Laia riigieksami II osas tuleb sageli näidata trigonomeetrilist samasust või lihtsustada avaldist kahekordse nurga valemitega.',
      can: 'Õpilane rakendab kahekordse nurga valemeid, lihtsustab trigonomeetrilisi avaldisi ja tõestab samasusi.',
      theory: [
        r`$\sin2\alpha=2\sin\alpha\cos\alpha$ — *valemilehel*`,
        r`$\cos2\alpha=\cos^2\alpha-\sin^2\alpha$ — *valemilehel*`,
        r`Põhiseosest: $\cos2\alpha=1-2\sin^2\alpha=2\cos^2\alpha-1$ — *pähe*`,
        r`$\tan2\alpha=\dfrac{2\tan\alpha}{1-\tan^2\alpha}$ — *valemilehel*`,
        r`Samasuse tõestus: teisenda üht poolt (tavaliselt keerulisemat), kuni saad teise poole; mõlemat poolt ei korrutata ega jagata — *pähe*`,
      ],
      ru_hint: [
        'sin 2α, cos 2α = cos²α − sin²α и tan 2α есть на листе формул lai; формы 1 − 2sin²α и 2cos²α − 1 выводим из sin² + cos² = 1.',
        'Тождество доказываем так: преобразуем одну часть, пока не получим другую.',
        '(sin α + cos α)² = 1 + sin 2α — частый приём.',
      ],
      example: {
        task: r`$\sin\alpha=0{,}6$ ja $90^\circ<\alpha<180^\circ$. Leia $\sin2\alpha$, $\cos2\alpha$ ja $\tan2\alpha$.`,
        steps: [
          r`II veerandis $\cos\alpha<0$: $\cos\alpha=-\sqrt{1-0{,}36}=-0{,}8$.`,
          r`$\sin2\alpha=2\cdot0{,}6\cdot(-0{,}8)=-0{,}96$; $\;\cos2\alpha=1-2\cdot0{,}36=0{,}28$.`,
          r`$\tan2\alpha=\dfrac{-0{,}96}{0{,}28}=-\dfrac{24}{7}\approx-3{,}43$.`,
          r`Kontroll: $180^\circ<2\alpha<360^\circ$, $\sin2\alpha<0$, $\cos2\alpha>0$ — $2\alpha$ on IV veerandis.`,
        ],
      },
      practice: [
        { title: r`$\cos\alpha=-\dfrac{5}{13}$ ja $180^\circ<\alpha<270^\circ$.`, parts: [
          [r`Leia $\sin2\alpha$.`, 2, '120/169|0,71', r`III veerandis $\sin\alpha=-\frac{12}{13}$; $\;2\cdot\left(-\frac{12}{13}\right)\left(-\frac5{13}\right)=\dfrac{120}{169}$`],
          [r`Leia $\cos2\alpha$.`, 1, '-119/169|-0,70', r`$\dfrac{25-144}{169}=-\dfrac{119}{169}$`, 1],
          [r`Leia $\tan2\alpha$.`, 1, '-120/119|-1,01', r`$\dfrac{120/169}{-119/169}=-\dfrac{120}{119}$`, 1],
        ] },
        { title: 'Arvuta täpselt ilma kalkulaatorita.', parts: [
          [r`$2\sin15^\circ\cos15^\circ$`, 1, '1/2|0,5', r`$\sin30^\circ=\frac12$`, 1],
          [r`$\cos^2 22{,}5^\circ-\sin^2 22{,}5^\circ$`, 1, '√2/2|sqrt(2)/2|0,71', r`$\cos45^\circ=\frac{\sqrt2}2$`, 1],
          [r`$1-2\sin^2 75^\circ$`, 1, '-√3/2|-sqrt(3)/2|-0,87', r`$\cos150^\circ=-\cos30^\circ=-\frac{\sqrt3}2$`, 1],
          [r`$\dfrac{2\tan15^\circ}{1-\tan^2 15^\circ}$`, 1, '√3/3|sqrt(3)/3|0,58', r`$\tan30^\circ=\frac{\sqrt3}3$`, 1],
        ] },
        { title: 'Lihtsusta.', parts: [
          [r`$\dfrac{\sin2\alpha}{2\sin\alpha}$`, 1, 'cosα|cos(α)|cosa|cos(a)', r`$\dfrac{2\sin\alpha\cos\alpha}{2\sin\alpha}=\cos\alpha$`, 1],
          [r`$\dfrac{1-\cos2\alpha}{\sin2\alpha}$`, 2, 'tanα|tan(α)|tana|tan(a)', r`$\dfrac{2\sin^2\alpha}{2\sin\alpha\cos\alpha}=\dfrac{\sin\alpha}{\cos\alpha}=\tan\alpha$`],
          [r`$(\cos\alpha-\sin\alpha)(\cos\alpha+\sin\alpha)$`, 1, 'cos2α|cos(2α)|cos2a|cos(2a)', r`$\cos^2\alpha-\sin^2\alpha=\cos2\alpha$`, 1],
        ] },
        { title: 'Tõesta samasus.', parts: [
          [r`$(\sin\alpha+\cos\alpha)^2=1+\sin2\alpha$`, 2, '', r`$\sin^2\alpha+2\sin\alpha\cos\alpha+\cos^2\alpha=1+\sin2\alpha$`],
          [r`$\cos^4\alpha-\sin^4\alpha=\cos2\alpha$`, 2, '', r`$(\cos^2\alpha-\sin^2\alpha)(\cos^2\alpha+\sin^2\alpha)=\cos2\alpha\cdot1$`],
          [r`$\tan\alpha+\dfrac1{\tan\alpha}=\dfrac{2}{\sin2\alpha}$`, 3, '', r`$\dfrac{\sin\alpha}{\cos\alpha}+\dfrac{\cos\alpha}{\sin\alpha}=\dfrac{\sin^2\alpha+\cos^2\alpha}{\sin\alpha\cos\alpha}=\dfrac{1}{\frac12\sin2\alpha}=\dfrac2{\sin2\alpha}$`, 4],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`On teada, et $\sin\alpha+\cos\alpha=\dfrac13$ ja $90^\circ<\alpha<180^\circ$.`, parts: [
        [r`Leia $\sin2\alpha$.`, 3, '-8/9|-0,89', r`Ruutu: $1+\sin2\alpha=\frac19$, seega $\sin2\alpha=-\frac89$.`, 3],
        [r`Leia $\sin\alpha\cos\alpha$.`, 1, '-4/9|-0,44', r`$\sin\alpha\cos\alpha=\frac12\sin2\alpha=-\frac49$`, 1],
        [r`Leia $\cos\alpha-\sin\alpha$.`, 3, '-√17/3|-sqrt(17)/3|-1,37', r`$(\cos\alpha-\sin\alpha)^2=1-\sin2\alpha=\frac{17}9$. II veerandis $\cos\alpha<0<\sin\alpha$, seega $\cos\alpha-\sin\alpha=-\dfrac{\sqrt{17}}3$.`, 4],
        [r`Leia $\cos2\alpha$.`, 3, '-√17/9|-sqrt(17)/9|-0,46', r`$\cos2\alpha=(\cos\alpha-\sin\alpha)(\cos\alpha+\sin\alpha)=-\dfrac{\sqrt{17}}3\cdot\dfrac13=-\dfrac{\sqrt{17}}9$`, 3],
      ] },
      self: ['Kasutan kahekordse nurga valemeid.', 'Valin cos 2α sobiva kuju.', 'Tõestan samasuse ühe poole teisendamisega.'],
    },
    {
      title: 'Siinusteoreem',
      ru: 'Теорема синусов',
      course: 'IV',
      exam: 'Laia riigieksami I osa 10-punktiline kolmnurgaülesanne lahendatakse siinus- või koosinusteoreemiga; siinusteoreem ei ole valemilehel.',
      can: 'Õpilane tõestab siinusteoreemi ümberringjoone abil, lahendab kolmnurga ja tunneb ära juhu, kus andmetele vastab kaks kolmnurka.',
      theory: [
        r`$\dfrac{a}{\sin\alpha}=\dfrac{b}{\sin\beta}=\dfrac{c}{\sin\gamma}=2R$ ($R$ — ümberringjoone raadius) — *pähe*`,
        r`Tõestus: diameeter $BD$; piirdenurk $\angle BDC=\alpha$ (sama kaar), kolmnurk $BCD$ on täisnurkne, seega $a=2R\sin\alpha$ — *pähe*`,
        r`$\sin(180^\circ-\beta)=\sin\beta$ — *valemilehel*`,
        r`Antud $a$, $b$, $\alpha$ ($a$ vastas): kui $a<b$ ja $b\sin\alpha<a$, on kaks kolmnurka ($\beta$ ja $180^\circ-\beta$); kui $b\sin\alpha=a$, üks täisnurkne; kui $b\sin\alpha>a$, ei ole ühtegi — *pähe*`,
      ],
      ru_hint: [
        'Теоремы синусов нет на листе формул lai — учим наизусть вместе с 2R.',
        'Если по синусу ищем угол, их может быть два: β и 180° − β. Проверяем, чтобы сумма углов была меньше 180°.',
        'Против большей стороны лежит больший угол.',
      ],
      example: {
        task: r`Kolmnurgas $a=7$, $b=9$ ja $\alpha=40^\circ$. Leia $\beta$, $\gamma$ ja $c$.`,
        steps: [
          r`$\sin\beta=\dfrac{b\sin\alpha}{a}=\dfrac{9\sin40^\circ}{7}\approx0{,}8264$.`,
          r`$\beta_1\approx55{,}73^\circ$ või $\beta_2=180^\circ-55{,}73^\circ=124{,}27^\circ$; mõlemal juhul $\alpha+\beta<180^\circ$ — kaks kolmnurka.`,
          r`$\gamma_1\approx84{,}27^\circ$, $c_1=\dfrac{7\sin84{,}27^\circ}{\sin40^\circ}\approx10{,}84$; $\;\gamma_2\approx15{,}73^\circ$, $c_2=\dfrac{7\sin15{,}73^\circ}{\sin40^\circ}\approx2{,}95$.`,
        ],
        figure: { kind: 'triangle', caption: 'Esimene kolmnurk ($\\beta_1\\approx55{,}73^\\circ$).', names: 'A B C', a: '7', b: '9', c: '10.84', sideA: 'a = 7', sideB: 'b = 9', sideC: 'c = ?', angleA: 'α = 40°', angleB: 'β = ?' },
      },
      practice: [
        { title: r`Kolmnurgas $\alpha=35^\circ$, $\beta=80^\circ$ ja $c=12$.`, parts: [
          [r`Leia $a$.`, 2, '7,59', r`$\gamma=65^\circ$; $a=\dfrac{12\sin35^\circ}{\sin65^\circ}\approx7{,}59$`],
          [r`Leia $b$.`, 1, '13,04', r`$b=\dfrac{12\sin80^\circ}{\sin65^\circ}\approx13{,}04$`, 1],
          [r`Leia ümberringjoone raadius $R$.`, 1, '6,62', r`$R=\dfrac{c}{2\sin\gamma}=\dfrac{12}{2\sin65^\circ}\approx6{,}62$`, 1],
        ] },
        { title: r`Kolmnurgas $a=10$ ja $\alpha=30^\circ$.`, parts: [
          [r`Leia $R$.`, 1, '10', r`$2R=\dfrac{10}{\sin30^\circ}=20$, $R=10$`, 1],
          [r`Leia $b$, kui $\beta=45^\circ$.`, 2, '10√2|10sqrt(2)|14,14', r`$b=2R\sin45^\circ=20\cdot\frac{\sqrt2}2=10\sqrt2$`],
        ] },
        { title: r`Mitu kolmnurka on antud andmetega ($\alpha$ on külje $a$ vastasnurk)?`, parts: [
          [r`$a=5$, $b=8$, $\alpha=30^\circ$`, 1, '2', r`$b\sin\alpha=4<5<8$: kaks kolmnurka.`, 1],
          [r`$a=4$, $b=8$, $\alpha=30^\circ$`, 1, '1', r`$b\sin\alpha=4=a$: $\sin\beta=1$, üks täisnurkne kolmnurk.`, 1],
          [r`$a=3$, $b=8$, $\alpha=30^\circ$`, 1, '0', r`$\sin\beta=\dfrac{8\cdot0{,}5}{3}>1$: ei ole ühtegi.`, 1],
        ] },
        { title: r`Kaks vaatluspunkti A ja B on Pärnu rannas 500 m vahega. Laev C on näha nurkade $\angle CAB=62^\circ$ ja $\angle CBA=48^\circ$ all.`, parts: [
          ['Leia kaugus $AC$ (m).', 2, '395,42', r`$\angle C=70^\circ$; $AC=\dfrac{500\sin48^\circ}{\sin70^\circ}\approx395{,}42$ m`],
          ['Leia kaugus $BC$ (m).', 1, '469,81', r`$BC=\dfrac{500\sin62^\circ}{\sin70^\circ}\approx469{,}81$ m`, 1],
          ['Kui kaugel on laev rannajoonest AB (m)?', 2, '349,13', r`$h=AC\sin62^\circ\approx349{,}13$ m`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Kolmnurgas $ABC$ on $a=BC=6$, $b=CA=8$ ja $\alpha=42^\circ$.`, parts: [
        [r`Leia $\sin\beta$ kahe kümnendkohaga.`, 2, '0,89', r`$\sin\beta=\dfrac{8\sin42^\circ}{6}\approx0{,}8922$`, 2],
        [r`Leia kõik võimalikud nurgad $\beta$ (kahe kümnendkohaga).`, 3, '63,15; 116,85', r`$\beta_1\approx63{,}15^\circ$, $\beta_2=180^\circ-63{,}15^\circ=116{,}85^\circ$; $42^\circ+116{,}85^\circ<180^\circ$, seega sobivad mõlemad.`, 3],
        [r`Leia mõlema kolmnurga külg $c$.`, 3, '8,66; 3,24', r`$\gamma_1\approx74{,}85^\circ$, $c_1=\dfrac{6\sin74{,}85^\circ}{\sin42^\circ}\approx8{,}66$; $\gamma_2\approx21{,}15^\circ$, $c_2=\dfrac{6\sin21{,}15^\circ}{\sin42^\circ}\approx3{,}24$`, 4],
        [r`Leia ümberringjoone raadius $R$. Kas see on mõlemal kolmnurgal sama?`, 2, '4,48', r`$R=\dfrac{a}{2\sin\alpha}=\dfrac6{2\sin42^\circ}\approx4{,}48$ — sama, sest $a$ ja $\alpha$ on samad.`, 2],
      ] },
      self: ['Tõestan siinusteoreemi ümberringjoone abil.', 'Leian külje või nurga siinusteoreemiga.', 'Kontrollin, kas on üks või kaks kolmnurka.'],
    },
    {
      title: 'Koosinusteoreem, kolmnurga lahendamine ja pindala',
      ru: 'Теорема косинусов, решение треугольника и площадь',
      course: 'IV',
      exam: 'Laia riigieksami I osa 7. ülesanne (10 p) on kolmnurk elulises olukorras: koosinusteoreem, pindala, kõrgus.',
      can: 'Õpilane tõestab koosinusteoreemi, lahendab mis tahes kolmnurga ning arvutab pindala eri valemitega.',
      theory: [
        r`$c^2=a^2+b^2-2ab\cos\gamma$; $\;\cos\gamma=\dfrac{a^2+b^2-c^2}{2ab}$ — *pähe*`,
        r`$\cos\gamma<0$ ⇔ $\gamma$ on nürinurk ($c^2>a^2+b^2$) — *pähe*`,
        r`$S=\dfrac12ab\sin\gamma$; $\;S=\sqrt{p(p-a)(p-b)(p-c)}$, $p=\dfrac{a+b+c}2$ (Heron) — *pähe*`,
        r`$S=\dfrac{abc}{4R}$, $\;S=pr$ ($r$ — siseringjoone raadius) — *pähe*`,
      ],
      ru_hint: [
        'Теоремы косинусов и формул площади нет на листе формул lai — учим наизусть.',
        'Две стороны и угол между ними → теорема косинусов; три стороны → сначала больший угол (против большей стороны).',
        'Формула Герона удобна, когда известны все три стороны.',
      ],
      example: {
        task: r`Kolmnurga küljed on $a=7$, $b=8$ ja $c=9$. Leia suurim nurk, pindala, $R$ ja $r$.`,
        steps: [
          r`Suurim nurk on suurima külje vastas: $\cos\gamma=\dfrac{49+64-81}{2\cdot7\cdot8}=\dfrac{32}{112}=\dfrac27$, $\gamma\approx73{,}40^\circ$.`,
          r`Heron: $p=12$, $S=\sqrt{12\cdot5\cdot4\cdot3}=\sqrt{720}=12\sqrt5\approx26{,}83$.`,
          r`$R=\dfrac{abc}{4S}=\dfrac{504}{4\cdot26{,}83}\approx4{,}70$; $\;r=\dfrac{S}{p}=\sqrt5\approx2{,}24$.`,
        ],
        figure: { kind: 'triangle', caption: 'Suurim nurk on külje $c=9$ vastas.', names: 'A B C', a: '7', b: '8', c: '9', sideA: 'a = 7', sideB: 'b = 8', sideC: 'c = 9', angleC: 'γ = ?' },
      },
      practice: [
        { title: r`Kolmnurgas $a=5$, $b=8$ ja $\gamma=60^\circ$.`, parts: [
          [r`Leia $c$.`, 2, '7', r`$c^2=25+64-2\cdot5\cdot8\cdot\frac12=49$, $c=7$`],
          ['Leia pindala.', 1, '10√3|10sqrt(3)|17,32', r`$S=\frac12\cdot5\cdot8\cdot\frac{\sqrt3}2=10\sqrt3\approx17{,}32$`, 1],
          [r`Leia kõrgus $h_c$.`, 1, '4,95', r`$h_c=\dfrac{2S}{c}=\dfrac{20\sqrt3}{7}\approx4{,}95$`, 1],
        ] },
        { title: 'Kolmnurga küljed on 4, 5 ja 7.', parts: [
          ['Leia suurim nurk (kahe kümnendkohaga).', 2, '101,54', r`$\cos\gamma=\dfrac{16+25-49}{40}=-0{,}2$, $\gamma\approx101{,}54^\circ$`],
          ['Kas kolmnurk on terav-, täis- või nürinurkne?', 1, 'nürinurkne', r`$\cos\gamma<0$: nürinurkne.`, 0],
          ['Leia pindala.', 2, '4√6|4sqrt(6)|9,80', r`$p=8$, $S=\sqrt{8\cdot4\cdot3\cdot1}=\sqrt{96}=4\sqrt6\approx9{,}80$`],
        ] },
        { title: r`Rööpküliku küljed on $6$ ja $10$, nendevaheline nurk $50^\circ$.`, parts: [
          ['Leia lühem diagonaal.', 2, '7,67', r`$d_1^2=36+100-120\cos50^\circ$, $d_1\approx7{,}67$`],
          ['Leia pikem diagonaal.', 2, '14,60', r`Teine nurk $130^\circ$: $d_2^2=136-120\cos130^\circ=136+120\cos50^\circ$, $d_2\approx14{,}60$`],
          ['Leia pindala.', 1, '45,96', r`$S=6\cdot10\cdot\sin50^\circ\approx45{,}96$`, 1],
        ] },
        { title: 'Koosinusteoreemi tõestus.', parts: [
          [r`Paiguta $C(0;0)$, $B(a;0)$, $A(b\cos\gamma;\,b\sin\gamma)$ ja tõesta, et $c^2=a^2+b^2-2ab\cos\gamma$.`, 3, '', r`$c^2=AB^2=(a-b\cos\gamma)^2+(b\sin\gamma)^2=a^2-2ab\cos\gamma+b^2(\cos^2\gamma+\sin^2\gamma)=a^2+b^2-2ab\cos\gamma$`, 4],
          [r`Mis valem tuleb, kui $\gamma=90^\circ$?`, 1, '', r`$\cos90^\circ=0$: $c^2=a^2+b^2$ — Pythagorase teoreem.`, 1],
          ['Kolmnurga küljed on 13, 14 ja 15. Leia pindala.', 2, '84', r`$p=21$, $S=\sqrt{21\cdot8\cdot7\cdot6}=\sqrt{7056}=84$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Kolmnurkse maatüki küljed on $AB=120$ m ja $AC=90$ m ning nendevaheline nurk on $75^\circ$.`,
        figure: { kind: 'triangle', caption: 'Maatükk $ABC$.', names: 'A B C', b: '90', c: '120', alpha: '75', sideB: 'AC = 90 m', sideC: 'AB = 120 m', sideA: 'BC = ?', angleA: '75°' },
        parts: [
          [r`Leia külg $BC$ (m, kahe kümnendkohaga).`, 3, '130,04', r`$BC^2=120^2+90^2-2\cdot120\cdot90\cos75^\circ\approx16909{,}5$, $BC\approx130{,}04$ m`, 3],
          ['Leia maatüki pindala (m², täisarvuni).', 2, '5216', r`$S=\frac12\cdot120\cdot90\cdot\sin75^\circ\approx5216$ m²`, 2],
          [r`Leia nurk $B$ (kahe kümnendkohaga).`, 3, '41,95', r`$\cos B=\dfrac{120^2+130{,}04^2-90^2}{2\cdot120\cdot130{,}04}\approx0{,}7438$, $B\approx41{,}95^\circ$`, 3],
          [r`Leia tipust $A$ küljele $BC$ tõmmatud kõrgus (m).`, 2, '80,22', r`$h=\dfrac{2S}{BC}=\dfrac{2\cdot5216}{130{,}04}\approx80{,}22$ m`, 2],
        ] },
      self: ['Tõestan koosinusteoreemi koordinaatidega.', 'Lahendan kolmnurga kolmest küljest või kahest küljest ja nurgast.', 'Valin sobiva pindala valemi.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: IV kursus',
      ru: 'Повторение и контрольная работа: IV курс',
      course: 'IV',
      exam: 'Kontrolltöö kordab trigonomeetriat samas vormis nagu laia riigieksami II osa: täpsed väärtused, valemid, samasus ja kolmnurk.',
      can: 'Õpilane lahendab IV kursuse põhiülesandeid iseseisvalt ja kirjutab lahenduskäigu.',
      theory: [
        r`$180^\circ=\pi$ rad; kaar $l=r\alpha$, sektor $S=\dfrac{r^2\alpha}2$ — *pähe*`,
        r`$\sin^2\alpha+\cos^2\alpha=1$, $\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}$; taandamisvalemid, paarsus, perioodilisus — *valemilehel*`,
        r`Summa, vahe ja kahekordse nurga valemid — *valemilehel*`,
        r`Siinus- ja koosinusteoreem, $S=\frac12ab\sin\gamma$, Heron, $S=\dfrac{abc}{4R}$ — *pähe*`,
      ],
      ru_hint: [
        'Контрольная: 25 баллов, 45 минут. Пиши все шаги — балл дают за каждый верный шаг.',
        'Тригонометрические формулы есть на листе формул lai, а теоремы синусов и косинусов, дуга и сектор — наизусть.',
        'Знак синуса и косинуса определяй по четверти.',
      ],
      example: {
        task: r`Lihtsusta $\dfrac{\sin3\alpha}{\sin\alpha}-\dfrac{\cos3\alpha}{\cos\alpha}$.`,
        steps: [
          r`Ühine nimetaja: $\dfrac{\sin3\alpha\cos\alpha-\cos3\alpha\sin\alpha}{\sin\alpha\cos\alpha}$.`,
          r`Lugeja on $\sin(3\alpha-\alpha)=\sin2\alpha$, nimetaja $\frac12\sin2\alpha$.`,
          r`Vastus: $2$.`,
        ],
      },
      practice: [
        { title: 'Nurgad.', parts: [
          [r`Teisenda $108^\circ$ radiaanideks.`, 1, '3π/5|3pi/5|1,88', r`$108\cdot\dfrac\pi{180}=\dfrac{3\pi}5\approx1{,}88$`, 1],
          [r`Teisenda $2{,}5$ rad kraadideks.`, 1, '143,24', r`$2{,}5\cdot\dfrac{180^\circ}\pi\approx143{,}24^\circ$`, 1],
        ] },
        { title: 'Leia täpne väärtus.', parts: [
          [r`$\cos(-240^\circ)$`, 1, '-1/2|-0,5', r`$\cos240^\circ=-\cos60^\circ=-\frac12$`, 1],
          [r`$\sin135^\circ$`, 1, '√2/2|sqrt(2)/2|0,71', r`$\sin45^\circ=\frac{\sqrt2}2$`, 1],
        ] },
        { title: 'Summa valem.', parts: [
          [r`Leia $\sin15^\circ$ täpselt.`, 2, '(√6-√2)/4|(sqrt(6)-sqrt(2))/4|0,26', r`$\sin(45^\circ-30^\circ)=\frac{\sqrt2}2\cdot\frac{\sqrt3}2-\frac{\sqrt2}2\cdot\frac12=\dfrac{\sqrt6-\sqrt2}4$`],
        ] },
        { title: r`Võrdhaarse kolmnurga haarad on $6$ ja tipunurk $120^\circ$.`, parts: [
          ['Leia alus.', 2, '6√3|6sqrt(3)|10,39', r`$c^2=36+36-72\cos120^\circ=108$, $c=6\sqrt3$`],
          ['Leia pindala.', 1, '9√3|9sqrt(3)|15,59', r`$\frac12\cdot36\cdot\sin120^\circ=9\sqrt3$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'IV kursus: trigonomeetria. Aega 45 minutit, kalkulaator, laia kursuse valemileht.', parts: [
        [r`1. Ringi raadius on $5$ cm ja sektori pindala $15$ cm². Leia kesknurk radiaanides.`, 2, '1,2', r`$15=\dfrac{25\alpha}{2}$, $\alpha=1{,}2$ rad`, 2],
        ['2. Leia selle sektori kaare pikkus (cm).', 1, '6', r`$l=5\cdot1{,}2=6$ cm`, 1],
        [r`3. $\cos\alpha=-0{,}6$ ja $180^\circ<\alpha<270^\circ$. Leia $\sin\alpha$.`, 2, '-0,8|-4/5', r`III veerandis $\sin\alpha<0$: $-\sqrt{1-0{,}36}=-0{,}8$`, 2],
        [r`4. Leia $\tan\alpha$.`, 1, '4/3|1,33', r`$\dfrac{-0{,}8}{-0{,}6}=\dfrac43$`, 1],
        [r`5. Leia $\sin2\alpha$.`, 2, '0,96|24/25', r`$2\cdot(-0{,}8)(-0{,}6)=0{,}96$`, 2],
        [r`6. Leia $\cos2\alpha$.`, 2, '-0,28|-7/25', r`$0{,}36-0{,}64=-0{,}28$`, 2],
        [r`7. Leia kõik nurgad $x\in[0^\circ;360^\circ]$, kus $\tan x=2{,}5$ (ühe kümnendkohaga).`, 2, '68,2; 248,2', r`$\tan^{-1}2{,}5\approx68{,}2^\circ$; $68{,}2^\circ+180^\circ=248{,}2^\circ$`, 2],
        [r`8. Leia $\cos75^\circ$ täpselt.`, 2, '(√6-√2)/4|(sqrt(6)-sqrt(2))/4|0,26', r`$\cos(45^\circ+30^\circ)=\frac{\sqrt2}2\cdot\frac{\sqrt3}2-\frac{\sqrt2}2\cdot\frac12=\dfrac{\sqrt6-\sqrt2}4$`, 2],
        [r`9. Tõesta samasus $\dfrac{1+\cos2\alpha}{\sin2\alpha}=\dfrac{1}{\tan\alpha}$.`, 3, '', r`$\dfrac{1+2\cos^2\alpha-1}{2\sin\alpha\cos\alpha}=\dfrac{\cos\alpha}{\sin\alpha}=\dfrac1{\tan\alpha}$`, 4],
        [r`10. Kolmnurgas $a=9$, $b=12$ ja $\gamma=50^\circ$. Leia $c$.`, 3, '9,28', r`$c^2=81+144-216\cos50^\circ\approx86{,}16$, $c\approx9{,}28$`, 3],
        ['11. Leia selle kolmnurga pindala.', 2, '41,37', r`$\frac12\cdot9\cdot12\cdot\sin50^\circ\approx41{,}37$`, 2],
        [r`12. Kolmnurgas $\alpha=40^\circ$, $\beta=75^\circ$ ja $a=10$. Leia $b$.`, 2, '15,03', r`$b=\dfrac{10\sin75^\circ}{\sin40^\circ}\approx15{,}03$`, 2],
        ['13. Leia selle kolmnurga ümberringjoone raadius.', 1, '7,78', r`$R=\dfrac{10}{2\sin40^\circ}\approx7{,}78$`, 1],
      ] },
      self: ['Oskan IV kursuse kõiki ülesandetüüpe.', 'Kasutan valemilehte õigesti.', 'Kirjutan iga sammu ja kontrollin märgi.'],
    },

    // ───────────── V kursus „Vektor tasandil. Joone võrrand” ─────────────
    {
      title: 'Kahe punkti kaugus, lõigu keskpunkt ja vektor',
      ru: 'Расстояние между точками, середина отрезка и вектор',
      course: 'V',
      exam: 'II osa analüütilise geomeetria ülesanne (10 p) algab alati lõigu pikkusest, keskpunktist või vektori koordinaatidest.',
      can: 'Õpilane leiab vektori koordinaadid ja pikkuse, kahe punkti kauguse ja lõigu keskpunkti ning ühikvektori.',
      theory: [
        r`Kahe punkti kaugus: $|AB|=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$ — *pähe*`,
        r`Lõigu keskpunkt: $M\left(\dfrac{x_1+x_2}{2};\dfrac{y_1+y_2}{2}\right)$ — *pähe*`,
        r`Vektor $\overrightarrow{AB}=(x_2-x_1;\,y_2-y_1)$, pikkus $|\vec a|=\sqrt{a_x^2+a_y^2}$ — *pähe*`,
        r`Nullvektor $\vec0=(0;0)$; vastandvektor $-\vec a=(-a_x;-a_y)$; ühikvektor $\vec e=\dfrac{\vec a}{|\vec a|}$ (pikkus $1$) — *pähe*`,
        r`$\vec i=(1;0)$, $\vec j=(0;1)$: $\;\vec a=a_x\vec i+a_y\vec j$; võrdsetel vektoritel on võrdsed koordinaadid — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai векторов нет: длину, середину и координаты вектора учим наизусть.',
        'Координаты вектора AB: из координат конца вычитаем координаты начала.',
        'Длина вектора — это теорема Пифагора для его координат.',
      ],
      example: {
        task: r`Antud on punktid $A(-1;2)$ ja $B(5;-6)$. Leia $\overrightarrow{AB}$, $|AB|$, lõigu $AB$ keskpunkt $M$ ja vektori $\overrightarrow{AB}$ ühikvektor.`,
        steps: [
          r`$\overrightarrow{AB}=(5-(-1);\,-6-2)=(6;-8)$.`,
          r`$|AB|=\sqrt{6^2+(-8)^2}=\sqrt{100}=10$.`,
          r`$M\left(\dfrac{-1+5}{2};\dfrac{2+(-6)}{2}\right)=M(2;-2)$.`,
          r`$\vec e=\dfrac{1}{10}(6;-8)=(0{,}6;-0{,}8)$; kontroll: $0{,}36+0{,}64=1$.`,
        ],
        graph: { fns: '', xmin: -2, xmax: 6, ymin: -7, ymax: 3, step: 1, stepY: 1, points: 'A(-1; 2)\nB(5; -6)\nM(2; -2)', segments: 'A-B' },
      },
      practice: [
        { title: r`Antud on punktid $A(2;-3)$ ja $B(-4;5)$.`, parts: [
          [r`Leia $\overrightarrow{AB}$.`, 1, '(-6;8)|-6;8', r`$\overrightarrow{AB}=(-4-2;\,5-(-3))=(-6;8)$`, 1],
          [r`Leia $|AB|$.`, 1, '10', r`$\sqrt{36+64}=\sqrt{100}=10$`, 1],
          [r`Leia lõigu $AB$ keskpunkt.`, 1, '(-1;1)|-1;1', r`$\left(\dfrac{2-4}{2};\dfrac{-3+5}{2}\right)=(-1;1)$`, 1],
        ] },
        { title: r`Vektor $\vec a=5\vec i-12\vec j$.`, parts: [
          [r`Kirjuta $\vec a$ koordinaadid.`, 1, '(5;-12)|5;-12', r`$\vec a=(5;-12)$`, 1],
          [r`Leia $|\vec a|$.`, 1, '13', r`$\sqrt{25+144}=\sqrt{169}=13$`, 1],
          [r`Leia vektori $\vec a$ ühikvektor (harilike murdudena).`, 2, '(5/13;-12/13)|5/13;-12/13|(0,38;-0,92)', r`$\vec e=\dfrac{\vec a}{13}=\left(\dfrac5{13};-\dfrac{12}{13}\right)\approx(0{,}38;-0{,}92)$`],
        ] },
        { title: r`Lõigu $AB$ keskpunkt on $M(1;4)$ ja $A(-3;1)$.`, parts: [
          [r`Leia punkt $B$.`, 2, '(5;7)|5;7', r`$x_B=2\cdot1-(-3)=5$, $\;y_B=2\cdot4-1=7$: $B(5;7)$.`],
          [r`Leia $|AB|$.`, 1, '10', r`$\sqrt{8^2+6^2}=\sqrt{100}=10$`, 1],
          [r`Leia $x$-teljel punkt $C$, mis on punktidest $A$ ja $B$ võrdsel kaugusel.`, 2, '(4;0)|4;0', r`$C(x;0)$: $(x+3)^2+1=(x-5)^2+49$, $\;6x+10=-10x+74$, $\;16x=64$, $x=4$: $C(4;0)$.`, 4],
        ] },
        { title: r`Kolmnurga tipud on $A(1;1)$, $B(4;5)$ ja $C(8;2)$.`, parts: [
          [r`Leia $|AB|$.`, 1, '5', r`$\sqrt{3^2+4^2}=5$`, 1],
          [r`Leia $|BC|$.`, 1, '5', r`$\sqrt{4^2+(-3)^2}=5$`, 1],
          [r`Leia $|AC|$.`, 1, '5√2|5sqrt(2)|5*sqrt(2)|7,07', r`$\sqrt{7^2+1^2}=\sqrt{50}=5\sqrt2\approx7{,}07$`, 1],
          ['Tõesta, et kolmnurk ABC on täisnurkne ja võrdhaarne.', 2, '', r`$|AB|=|BC|=5$ — võrdhaarne. $|AB|^2+|BC|^2=25+25=50=|AC|^2$, seega Pythagorase teoreemi pöördteoreemi järgi on nurk $B$ täisnurk.`, 3],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Ringjoone keskpunkt on $K(1;2)$ ja ringjoon läbib punkti $A(4;6)$.`, parts: [
        ['Leia ringjoone raadius.', 1, '5', r`$r=|KA|=\sqrt{3^2+4^2}=5$`, 2],
        [r`Kas punkt $B(6;2)$ asub ringjoonel? Kirjuta jah või ei.`, 2, 'jah', r`$|KB|=\sqrt{5^2+0^2}=5=r$, seega asub.`, 2],
        [r`Leia läbimõõdu $AD$ teine otspunkt $D$.`, 2, '(-2;-2)|-2;-2', r`$K$ on lõigu $AD$ keskpunkt: $x_D=2\cdot1-4=-2$, $\;y_D=2\cdot2-6=-2$.`, 3],
      ] },
      self: ['Leian vektori koordinaadid ja pikkuse.', 'Leian lõigu keskpunkti ja otspunkti keskpunkti kaudu.', 'Leian ühikvektori.'],
    },
    {
      title: 'Tehted vektoritega',
      ru: 'Действия с векторами',
      course: 'V',
      exam: 'II osa analüütilise geomeetria ülesandes leitakse rööpküliku tipp, mediaan või raskuskese vektorite abil.',
      can: 'Õpilane liidab ja lahutab vektoreid, korrutab vektorit arvuga, kasutab kohavektorit ja jaotab lõigu antud suhtes.',
      theory: [
        r`$\vec a\pm\vec b=(a_x\pm b_x;\,a_y\pm b_y)$, $\;k\vec a=(ka_x;\,ka_y)$ — *pähe*`,
        r`Kolmnurgareegel $\overrightarrow{AB}+\overrightarrow{BC}=\overrightarrow{AC}$; rööpkülikureegel $\overrightarrow{AB}+\overrightarrow{AD}=\overrightarrow{AC}$ — *pähe*`,
        r`Kohavektor: $\overrightarrow{OB}=\overrightarrow{OA}+\overrightarrow{AB}$ (punkti ja vektorit liita ei saa) — *pähe*`,
        r`Punkt $P$ jaotab lõigu $AB$ suhtes $AP:PB=m:n$: $\;\overrightarrow{OP}=\overrightarrow{OA}+\dfrac{m}{m+n}\overrightarrow{AB}$ — *pähe*`,
        r`$ABCD$ on rööpkülik $\Leftrightarrow\overrightarrow{AB}=\overrightarrow{DC}$; raskuskese $G\left(\dfrac{x_A+x_B+x_C}{3};\dfrac{y_A+y_B+y_C}{3}\right)$ — *pähe*`,
      ],
      ru_hint: [
        'Векторов на листе формул нет — правила действий учим наизусть.',
        'Конец вектора: OB = OA + AB. Нельзя писать «B = A + AB» — точку с вектором не складывают.',
        'ABCD — параллелограмм, если AB = DC (векторы равны).',
      ],
      example: {
        task: r`Rööpküliku $ABCD$ tipud on $A(-2;1)$, $B(3;2)$ ja $C(5;6)$. Leia tipp $D$.`,
        steps: [
          r`Rööpkülikus $\overrightarrow{DC}=\overrightarrow{AB}=(5;1)$.`,
          r`$\overrightarrow{OD}=\overrightarrow{OC}-\overrightarrow{DC}=(5;6)-(5;1)=(0;5)$.`,
          r`Vastus: $D(0;5)$. Kontroll: $\overrightarrow{AD}=(2;4)=\overrightarrow{BC}$.`,
        ],
        figure: { kind: 'polygon', points: 'A(-2;1) B(3;2) C(5;6) D(0;5)', coords: true, caption: 'Rööpkülik $ABCD$' },
      },
      practice: [
        { title: r`$\vec a=(2;-3)$ ja $\vec b=(-1;4)$.`, parts: [
          [r`Leia $\vec a+\vec b$.`, 1, '(1;1)|1;1', r`$(2-1;\,-3+4)=(1;1)$`, 1],
          [r`Leia $3\vec a-2\vec b$.`, 1, '(8;-17)|8;-17', r`$(6;-9)-(-2;8)=(8;-17)$`, 1],
          [r`Leia $|\vec a-\vec b|$.`, 2, '√58|sqrt(58)|7,62', r`$\vec a-\vec b=(3;-7)$, $\;\sqrt{9+49}=\sqrt{58}\approx7{,}62$`],
        ] },
        { title: r`$A(1;-2)$ ja $\overrightarrow{AB}=(4;5)$.`, parts: [
          [r`Leia punkt $B$.`, 1, '(5;3)|5;3', r`$\overrightarrow{OB}=\overrightarrow{OA}+\overrightarrow{AB}=(1+4;\,-2+5)=(5;3)$`, 1],
          [r`Leia punkt $C$, kui $\overrightarrow{AC}=-2\overrightarrow{AB}$.`, 2, '(-7;-12)|-7;-12', r`$-2\overrightarrow{AB}=(-8;-10)$; $\;\overrightarrow{OC}=(1-8;\,-2-10)=(-7;-12)$`],
        ] },
        { title: r`Lõigu otspunktid on $A(-1;2)$ ja $B(8;-4)$.`, parts: [
          [r`Leia punkt $P$, mille korral $AP:PB=1:2$.`, 2, '(2;0)|2;0', r`$\overrightarrow{AB}=(9;-6)$; $\;\overrightarrow{OP}=(-1;2)+\dfrac13(9;-6)=(2;0)$`],
          [r`Leia punkt $Q$, mille korral $AQ:QB=2:1$.`, 2, '(5;-2)|5;-2', r`$\overrightarrow{OQ}=(-1;2)+\dfrac23(9;-6)=(5;-2)$`],
        ] },
        { title: r`Nelinurga tipud on $A(0;0)$, $B(4;1)$, $C(5;5)$ ja $D(1;4)$.`, parts: [
          [r`Leia $\overrightarrow{AB}$ ja $\overrightarrow{DC}$ (kirjuta üks vektor, kui need on võrdsed).`, 1, '(4;1)|4;1', r`$\overrightarrow{AB}=(4;1)$, $\;\overrightarrow{DC}=(5-1;\,5-4)=(4;1)$ — võrdsed, seega rööpkülik.`, 1],
          [r`Leia $|AB|$ ja $|AD|$ (üks arv, kui need on võrdsed).`, 1, '√17|sqrt(17)|4,12', r`$|AB|=\sqrt{16+1}=\sqrt{17}$, $\;\overrightarrow{AD}=(1;4)$, $|AD|=\sqrt{17}$`, 1],
          ['Mis nelinurk see on (rööpkülik, ristkülik, romb või ruut)?', 2, 'romb', r`Rööpkülik, mille naaberküljed on võrdsed, on romb. $\overrightarrow{AB}\cdot\overrightarrow{AD}=4+4=8\ne0$, seega nurk ei ole täisnurk ja see ei ole ruut.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Kolmnurga tipud on $A(-3;-1)$, $B(5;3)$ ja $C(1;7)$.`, grid: { xmin: -8, xmax: 6, ymin: -2, ymax: 8, step: 1, stepY: 1, blank: true }, parts: [
        [r`Leia külje $AB$ keskpunkt $M$.`, 1, '(1;1)|1;1', r`$M\left(\dfrac{-3+5}2;\dfrac{-1+3}2\right)=(1;1)$`, 1],
        [r`Leia mediaanivektor $\overrightarrow{CM}$ ja mediaani $CM$ pikkus.`, 2, '(0;-6); 6|0;-6; 6', r`$\overrightarrow{CM}=(1-1;\,1-7)=(0;-6)$, $\;|CM|=6$`, 2],
        [r`Leia kolmnurga raskuskese $G$.`, 2, '(1;3)|1;3', r`$G\left(\dfrac{-3+5+1}3;\dfrac{-1+3+7}3\right)=(1;3)$`, 2],
        [r`Leia punkt $D$, mille korral $ABCD$ on rööpkülik.`, 2, '(-7;3)|-7;3', r`$\overrightarrow{AD}=\overrightarrow{BC}=(-4;4)$; $\;\overrightarrow{OD}=(-3-4;\,-1+4)=(-7;3)$`, 3],
        [r`Joonesta kolmnurk $ABC$, mediaan $CM$ ja rööpkülik $ABCD$.`, 2, '', 'Tipud koordinaatteljestikus, lõigud joonlauaga; kontroll: AD ∥ BC ja CD ∥ AB.', 0],
        [r`Näita vektorite abil, et $G$ jaotab mediaani $CM$ suhtes $2:1$ (alates tipust $C$).`, 1, '', r`$\overrightarrow{CG}=(0;-4)=\dfrac23(0;-6)=\dfrac23\overrightarrow{CM}$, seega $CG:GM=2:1$.`, 2],
      ] },
      self: ['Liidan ja lahutan vektoreid koordinaatides.', 'Leian punkti kohavektori abil.', 'Määran vektoritega nelinurga liigi.'],
    },
    {
      title: 'Skalaarkorrutis, nurk, ristseis ja kollineaarsus',
      ru: 'Скалярное произведение, угол, перпендикулярность и коллинеарность',
      course: 'V',
      exam: 'II osa analüütilise geomeetria ülesandes leitakse kolmnurga nurk vektoritega ja täpne pindala.',
      can: 'Õpilane arvutab skalaarkorrutise, leiab vektorite vahelise nurga ning kontrollib ristseisu ja kollineaarsust.',
      theory: [
        r`$\vec a\cdot\vec b=|\vec a|\,|\vec b|\cos\varphi$ ja $\;\vec a\cdot\vec b=a_xb_x+a_yb_y$ — *pähe*`,
        r`$\cos\varphi=\dfrac{\vec a\cdot\vec b}{|\vec a|\,|\vec b|}$, $\;0^\circ\le\varphi\le180^\circ$ — *pähe*`,
        r`Ristseis: $\vec a\perp\vec b\Leftrightarrow\vec a\cdot\vec b=0$; kollineaarsus: $\vec a\parallel\vec b\Leftrightarrow\dfrac{a_x}{b_x}=\dfrac{a_y}{b_y}$ ($a_xb_y-a_yb_x=0$) — *pähe*`,
        r`$\sin^2\varphi+\cos^2\varphi=1$ — *valemilehel*`,
        r`Kolmnurga pindala $S=\dfrac12|\overrightarrow{AB}|\,|\overrightarrow{AC}|\sin A$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai есть только sin²φ + cos²φ = 1; скалярное произведение и формулу угла учим наизусть.',
        'Угол треугольника при вершине A: оба вектора начинаются в A (AB и AC), иначе получится внешний угол.',
        'Точная площадь: sin A находим из cos A через sin²A + cos²A = 1, без калькулятора.',
      ],
      example: {
        task: r`Kolmnurga tipud on $A(1;1)$, $B(5;2)$ ja $C(2;4)$. Leia nurk $A$ ja kolmnurga täpne pindala.`,
        steps: [
          r`$\overrightarrow{AB}=(4;1)$, $\;\overrightarrow{AC}=(1;3)$; $\;\overrightarrow{AB}\cdot\overrightarrow{AC}=4+3=7$.`,
          r`$|AB|=\sqrt{17}$, $\;|AC|=\sqrt{10}$; $\;\cos A=\dfrac{7}{\sqrt{170}}$, $A\approx57{,}53^\circ$.`,
          r`$\sin A=\sqrt{1-\dfrac{49}{170}}=\dfrac{11}{\sqrt{170}}$.`,
          r`$S=\dfrac12\cdot\sqrt{17}\cdot\sqrt{10}\cdot\dfrac{11}{\sqrt{170}}=\dfrac{11}{2}=5{,}5$.`,
        ],
        figure: { kind: 'polygon', points: 'A(1;1) B(5;2) C(2;4)', coords: true, caption: 'Nurk $A$ vektorite $\\overrightarrow{AB}$ ja $\\overrightarrow{AC}$ vahel' },
      },
      practice: [
        { title: r`$\vec a=(3;-2)$ ja $\vec b=(4;6)$.`, parts: [
          [r`Leia $\vec a\cdot\vec b$.`, 1, '0', r`$3\cdot4+(-2)\cdot6=0$`, 1],
          ['Kas vektorid on risti? Kirjuta jah või ei.', 1, 'jah', 'Skalaarkorrutis on 0, seega on risti.', 0],
          [r`Leia $|\vec a+\vec b|$.`, 2, '√65|sqrt(65)|8,06', r`$\vec a+\vec b=(7;4)$, $\;\sqrt{49+16}=\sqrt{65}\approx8{,}06$`],
        ] },
        { title: r`$\vec a=(2;1)$ ja $\vec b=(1;3)$.`, parts: [
          [r`Leia $\vec a\cdot\vec b$.`, 1, '5', r`$2+3=5$`, 1],
          ['Leia vektorite vaheline nurk kraadides.', 2, '45', r`$\cos\varphi=\dfrac{5}{\sqrt5\cdot\sqrt{10}}=\dfrac{5}{5\sqrt2}=\dfrac{\sqrt2}{2}$, $\;\varphi=45^\circ$`],
        ] },
        { title: r`$\vec a=(k;4)$ ja $\vec b=(3;-6)$.`, parts: [
          [r`Leia $k$, mille korral $\vec a\perp\vec b$.`, 2, '8', r`$3k-24=0$, $k=8$`],
          [r`Leia $k$, mille korral $\vec a\parallel\vec b$.`, 2, '-2', r`$\dfrac k3=\dfrac{4}{-6}$, $\;k=-2$`],
          [r`Milliste $k$ väärtuste korral on vektorite vaheline nurk terav?`, 2, 'k>8|(8;∞)|(8;inf)', r`Nurk on terav, kui $\vec a\cdot\vec b=3k-24>0$, s.t $k>8$ (samasuunalisuse juht $k=-2$ siia ei kuulu).`],
        ] },
        { title: r`Kolmnurga tipud on $A(-1;0)$, $B(3;2)$ ja $C(1;6)$.`, parts: [
          [r`Leia $\overrightarrow{BA}\cdot\overrightarrow{BC}$.`, 1, '0', r`$\overrightarrow{BA}=(-4;-2)$, $\overrightarrow{BC}=(-2;4)$: $8-8=0$`, 1],
          ['Leia nurk B kraadides.', 1, '90', 'Skalaarkorrutis on 0, seega nurk B on 90°.', 1],
          ['Leia kolmnurga pindala.', 2, '10', r`$|BA|=|BC|=\sqrt{20}$; täisnurkses kolmnurgas $S=\dfrac12\cdot\sqrt{20}\cdot\sqrt{20}=10$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Kolmnurga tipud on $A(-2;1)$, $B(4;-1)$ ja $C(2;5)$.`,
        figure: { kind: 'polygon', points: 'A(-2;1) B(4;-1) C(2;5)', coords: true }, parts: [
        [r`Leia $\cos A$ täpselt.`, 3, '√5/5|1/√5|sqrt(5)/5|0,45', r`$\overrightarrow{AB}=(6;-2)$, $\overrightarrow{AC}=(4;4)$; $\;\overrightarrow{AB}\cdot\overrightarrow{AC}=24-8=16$; $\;|AB|=\sqrt{40}$, $|AC|=\sqrt{32}$; $\;\cos A=\dfrac{16}{\sqrt{1280}}=\dfrac{16}{16\sqrt5}=\dfrac{\sqrt5}{5}$`, 4],
        [r`Leia $\sin A$ täpselt.`, 2, '2√5/5|2/√5|2sqrt(5)/5|0,89', r`$\sin A=\sqrt{1-\dfrac15}=\dfrac{2}{\sqrt5}=\dfrac{2\sqrt5}{5}$ (nurk kolmnurgas, siinus positiivne)`, 2],
        ['Leia kolmnurga täpne pindala.', 3, '16', r`$S=\dfrac12\cdot\sqrt{40}\cdot\sqrt{32}\cdot\dfrac{2}{\sqrt5}=\dfrac{\sqrt{1280}}{\sqrt5}=\sqrt{256}=16$`, 3],
        [r`Leia nurk $A$ kraadides kahe kümnendkohani.`, 2, '63,43', r`$A=\cos^{-1}\dfrac{\sqrt5}{5}\approx63{,}43^\circ$`, 1],
      ] },
      self: ['Arvutan skalaarkorrutise koordinaatidest.', 'Leian nurga, alustades vektoreid nurga tipust.', 'Leian täpse pindala siinuse kaudu.'],
    },
    {
      title: 'Sirge võrrandid',
      ru: 'Уравнения прямой',
      course: 'V',
      exam: 'II osa analüütilise geomeetria ülesandes koostatakse sirge, kõrguse või keskristsirge võrrand.',
      can: 'Õpilane koostab sirge võrrandi punkti ja tõusu, kahe punkti või normaalvektori järgi ning leiab tõusunurga ja telglõigud.',
      theory: [
        r`Tõus $k=\tan\alpha=\dfrac{y_2-y_1}{x_2-x_1}$ ($\alpha$ — tõusunurk) — *pähe*`,
        r`Punkti ja tõusu järgi: $y-y_1=k(x-x_1)$; tõusuga kuju $y=kx+b$ — *pähe*`,
        r`Kahe punkti järgi: $\dfrac{x-x_1}{x_2-x_1}=\dfrac{y-y_1}{y_2-y_1}$ — *pähe*`,
        r`Üldvõrrand $Ax+By+C=0$: normaalvektor $\vec n=(A;B)$, sihivektor $\vec s=(-B;A)$, tõus $k=-\dfrac AB$ — *pähe*`,
        r`Telglõikudega võrrand: $\dfrac xa+\dfrac yb=1$ (sirge lõikab telgi punktides $(a;0)$ ja $(0;b)$) — *pähe*`,
      ],
      ru_hint: [
        'Уравнений прямой на листе формул lai нет — все формы учим наизусть.',
        'Угловой коэффициент k = tg α — тангенс угла наклона к оси x.',
        'Из общего уравнения Ax + By + C = 0: нормальный вектор (A; B), направляющий (−B; A).',
      ],
      example: {
        task: r`Koosta punkte $A(-1;-2)$ ja $B(3;4)$ läbiva sirge võrrand ja leia tõusunurk.`,
        steps: [
          r`$k=\dfrac{4-(-2)}{3-(-1)}=\dfrac64=1{,}5$.`,
          r`$y+2=1{,}5(x+1)$, $\;y=1{,}5x-0{,}5$; üldvõrrand $3x-2y-1=0$.`,
          r`$\tan\alpha=1{,}5$, $\;\alpha\approx56{,}31^\circ$.`,
        ],
        graph: { fns: 'y = 1.5x - 0.5', xmin: -3, xmax: 5, ymin: -4, ymax: 6, step: 1, stepY: 1, points: 'A(-1; -2)\nB(3; 4)' },
      },
      practice: [
        { title: r`Sirge läbib punkti $P(2;-1)$ ja tema tõus on $-3$.`, parts: [
          ['Koosta sirge võrrand.', 2, 'y=-3x+5|-3x+5|3x+y-5=0', r`$y+1=-3(x-2)$, $\;y=-3x+5$`],
          [r`Kus lõikab sirge $y$-telge? Kirjuta $y$.`, 1, '5', r`$x=0$: $y=5$`, 1],
          ['Leia sirge tõusunurk kahe kümnendkohani.', 2, '108,43', r`$\tan\alpha=-3$; $\;\alpha=180^\circ-71{,}57^\circ\approx108{,}43^\circ$`],
        ] },
        { title: r`Sirge läbib punkte $A(-2;5)$ ja $B(4;-1)$.`, parts: [
          ['Leia tõus.', 1, '-1', r`$k=\dfrac{-1-5}{4+2}=-1$`, 1],
          ['Koosta sirge võrrand.', 2, 'y=-x+3|-x+3|x+y-3=0', r`$y-5=-(x+2)$, $\;y=-x+3$`],
          [r`Leia sirge ja $x$-telje lõikepunkt.`, 1, '(3;0)|3;0', r`$y=0$: $x=3$`, 1],
        ] },
        { title: r`Sirge üldvõrrand on $2x-3y+6=0$.`, parts: [
          ['Leia tõus.', 1, '2/3|0,67', r`$3y=2x+6$, $\;y=\dfrac23x+2$: $k=\dfrac23$`, 1],
          [r`Leia telglõik $x$-teljel ($a$).`, 1, '-3', r`$y=0$: $2x=-6$, $x=-3$; telglõikudega $\dfrac{x}{-3}+\dfrac y2=1$`, 1],
          [r`Leia telglõik $y$-teljel ($b$).`, 1, '2', r`$x=0$: $y=2$`, 1],
          ['Kirjuta sirge normaalvektor.', 1, '(2;-3)|2;-3', r`$\vec n=(A;B)=(2;-3)$`, 1],
        ] },
        { title: r`Sirge tõusunurk on $60^\circ$ ja sirge läbib punkti $(0;-2)$.`, parts: [
          ['Koosta sirge võrrand.', 2, 'y=√3x-2|√3x-2|y=sqrt(3)x-2|sqrt(3)x-2', r`$k=\tan60^\circ=\sqrt3$; $\;y=\sqrt3x-2$`],
          [r`Kas punkt $(\sqrt3;1)$ asub sirgel? Kirjuta jah või ei.`, 1, 'jah', r`$\sqrt3\cdot\sqrt3-2=3-2=1$ — asub.`, 1],
          [r`Leia sirge ja $x$-telje lõikepunkti abstsiss kahe kümnendkohani.`, 1, '1,15|2√3/3', r`$\sqrt3x=2$, $\;x=\dfrac{2}{\sqrt3}=\dfrac{2\sqrt3}{3}\approx1{,}15$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Antud on punktid $A(-3;2)$ ja $B(5;-2)$.`, parts: [
        [r`Koosta sirge $AB$ võrrand.`, 2, 'y=-0,5x+0,5|-0,5x+0,5|x+2y-1=0', r`$k=\dfrac{-2-2}{5+3}=-0{,}5$; $\;y-2=-0{,}5(x+3)$, $\;y=-0{,}5x+0{,}5$`, 3],
        [r`Koosta lõigu $AB$ keskristsirge võrrand.`, 2, 'y=2x-2|2x-2|2x-y-2=0', r`Keskpunkt $M(1;0)$; ristsirge tõus $k=-\dfrac{1}{-0{,}5}=2$; $\;y=2(x-1)=2x-2$`, 3],
        [r`Leia keskristsirge ja $y$-telje lõikepunkt.`, 1, '(0;-2)|0;-2', r`$x=0$: $y=-2$`, 1],
      ] },
      self: ['Leian tõusu kahe punkti järgi ja tõusunurga.', 'Koostan sirge võrrandi punkti ja tõusu järgi.', 'Loen üldvõrrandist normaalvektori ja telglõigud.'],
    },
    {
      title: 'Sirgete vastastikune asend ja nurk',
      ru: 'Взаимное расположение прямых и угол между ними',
      course: 'V',
      exam: 'II osa analüütilise geomeetria ülesandes leitakse kõrguse aluspunkt, punkti kaugus sirgest ja kolmnurga pindala.',
      can: 'Õpilane määrab sirgete vastastikuse asendi, leiab sirgetevahelise nurga ja punkti kauguse sirgest ristsirge abil.',
      theory: [
        r`$y=k_1x+b_1$ ja $y=k_2x+b_2$: paralleelsed $\Leftrightarrow k_1=k_2$, $b_1\ne b_2$; risti $\Leftrightarrow k_1k_2=-1$ — *pähe*`,
        r`Üldvõrrandid: risti $\Leftrightarrow A_1A_2+B_1B_2=0$ (normaalvektorid risti); paralleelsed $\Leftrightarrow\dfrac{A_1}{A_2}=\dfrac{B_1}{B_2}$ — *pähe*`,
        r`Sirgetevaheline nurk: $\tan\varphi=\left|\dfrac{k_2-k_1}{1+k_1k_2}\right|$ või $\cos\varphi=\dfrac{|\vec s_1\cdot\vec s_2|}{|\vec s_1|\,|\vec s_2|}$, $0^\circ\le\varphi\le90^\circ$ — *pähe*`,
        r`Punkti $P$ kaugus sirgest: ristsirge läbi $P$ $\to$ aluspunkt $H$ (süsteemi lahend) $\to$ $d=|PH|$ — *pähe*`,
      ],
      ru_hint: [
        'Этих формул на листе формул lai нет: условия параллельности и перпендикулярности учим наизусть.',
        'Перпендикулярные прямые: k₁·k₂ = −1, то есть k₂ = −1/k₁.',
        'Расстояние от точки до прямой: перпендикуляр → точка пересечения H → длина PH.',
      ],
      example: {
        task: r`Leia punkti $P(6;1)$ kaugus sirgest $y=2x-3$.`,
        steps: [
          r`Ristsirge tõus on $-\dfrac12$: $\;y-1=-\dfrac12(x-6)$, $\;y=-0{,}5x+4$.`,
          r`Aluspunkt: $2x-3=-0{,}5x+4$, $\;2{,}5x=7$, $x=2{,}8$, $y=2{,}6$: $H(2{,}8;2{,}6)$.`,
          r`$d=|PH|=\sqrt{3{,}2^2+1{,}6^2}=\sqrt{12{,}8}\approx3{,}58$.`,
        ],
        graph: { fns: 'y = 2x - 3\ny = -0.5x + 4', xmin: -1, xmax: 8, ymin: -3, ymax: 7, step: 1, stepY: 1, points: 'P(6; 1)\nH(2.8; 2.6)', segments: 'P-H' },
      },
      practice: [
        { title: r`Antud on sirge $y=3x-1$.`, parts: [
          [r`Koosta antud sirgega paralleelse ja punkti $(2;0)$ läbiva sirge võrrand.`, 2, 'y=3x-6|3x-6|3x-y-6=0', r`$k=3$: $y=3(x-2)=3x-6$`],
          [r`Koosta antud sirgega risti oleva ja punkti $(3;1)$ läbiva sirge võrrand.`, 2, 'y=-x/3+2|-x/3+2|x+3y-6=0', r`$k=-\dfrac13$: $y-1=-\dfrac13(x-3)$, $\;y=-\dfrac x3+2$`],
        ] },
        { title: 'Määra sirgete vastastikune asend: paralleelsed, risti, ühtivad või lõikuvad (mitte risti).', parts: [
          [r`$2x-4y+1=0$ ja $y=0{,}5x+3$`, 1, 'paralleelsed', r`Esimese tõus $k=\dfrac24=0{,}5$, $b=0{,}25\ne3$: paralleelsed.`, 1],
          [r`$3x+2y=5$ ja $4x-6y=1$`, 1, 'risti', r`$\vec n_1\cdot\vec n_2=3\cdot4+2\cdot(-6)=0$: risti.`, 1],
          [r`$x-y=1$ ja $2x-2y=2$`, 1, 'ühtivad', 'Teine võrrand on esimene korrutatud 2-ga: sirged ühtivad.', 1],
        ] },
        { title: 'Leia sirgetevaheline nurk kraadides (kahe kümnendkohani).', parts: [
          [r`$y=2x+1$ ja $y=-3x+4$`, 2, '45', r`$\tan\varphi=\left|\dfrac{-3-2}{1-6}\right|=1$, $\;\varphi=45^\circ$`],
          [r`$3x-y+2=0$ ja $x+2y-4=0$`, 2, '81,87', r`$k_1=3$, $k_2=-0{,}5$: $\tan\varphi=\left|\dfrac{-0{,}5-3}{1-1{,}5}\right|=7$, $\;\varphi\approx81{,}87^\circ$`],
        ] },
        { title: r`Antud on sirged $ax+2y-3=0$ ja $3x-y+5=0$.`, parts: [
          [r`Leia $a$, mille korral sirged on paralleelsed.`, 2, '-6', r`$k_1=-\dfrac a2$, $k_2=3$: $-\dfrac a2=3$, $a=-6$ (siis $-6x+2y-3=0$, $b$-d erinevad)`],
          [r`Leia $a$, mille korral sirged on risti.`, 2, '2/3|0,67', r`$3a+2\cdot(-1)=0$, $a=\dfrac23$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Kolmnurga tipud on $A(-2;-1)$, $B(6;3)$ ja $C(1;6)$.`,
        figure: { kind: 'polygon', points: 'A(-2;-1) B(6;3) C(1;6)', coords: true }, parts: [
        [r`Koosta sirge $AB$ võrrand.`, 2, 'y=0,5x|0,5x|y=x/2|x/2|x-2y=0', r`$k=\dfrac{3+1}{6+2}=0{,}5$; $\;y+1=0{,}5(x+2)$, $\;y=0{,}5x$`, 2],
        [r`Koosta tipust $C$ tõmmatud kõrguse sirge võrrand.`, 2, 'y=-2x+8|-2x+8|2x+y-8=0', r`$k=-2$: $y-6=-2(x-1)$, $\;y=-2x+8$`, 2],
        [r`Leia kõrguse aluspunkt $H$.`, 2, '(3,2;1,6)|3,2;1,6', r`$0{,}5x=-2x+8$, $\;x=3{,}2$, $y=1{,}6$`, 2],
        [r`Leia kõrguse $CH$ pikkus kahe kümnendkohani.`, 2, '4,92', r`$\sqrt{(1-3{,}2)^2+(6-1{,}6)^2}=\sqrt{24{,}2}\approx4{,}92$`, 2],
        ['Leia kolmnurga pindala.', 2, '22', r`$|AB|=\sqrt{80}$; $\;S=\dfrac12\sqrt{80}\cdot\sqrt{24{,}2}=\dfrac12\sqrt{1936}=\dfrac{44}{2}=22$`, 2],
      ] },
      self: ['Tunnen tõusudest ära paralleelsed ja ristuvad sirged.', 'Leian sirgetevahelise nurga.', 'Leian punkti kauguse sirgest ristsirge abil.'],
    },
    {
      title: 'Ringjoone, parabooli ja hüperbooli võrrand',
      ru: 'Уравнения окружности, параболы и гиперболы',
      course: 'V',
      exam: 'II osa analüütilise geomeetria ülesandes on ringjoone võrrand ja puutuja; parabool ja hüperbool on funktsiooniülesannetes.',
      can: 'Õpilane koostab ringjoone võrrandi, leiab täisruuduks täiendamisega keskpunkti ja raadiuse, parabooli haripunkti ning hüperbooli asümptoodid.',
      theory: [
        r`Ringjoon keskpunktiga $(a;b)$ ja raadiusega $r$: $(x-a)^2+(y-b)^2=r^2$ — *pähe*`,
        r`$x^2+y^2+Dx+Ey+F=0$: täisruuduks täiendamine, keskpunkt $\left(-\dfrac D2;-\dfrac E2\right)$, $r^2=\dfrac{D^2}4+\dfrac{E^2}4-F$ (kui $r^2\le0$, ei ole ringjoont) — *pähe*`,
        r`Parabool $y=ax^2+bx+c$: haripunkt $x_0=-\dfrac{b}{2a}$; haripunktikuju $y=a(x-x_0)^2+y_0$ — *pähe*`,
        r`Hüperbool $y=\dfrac kx$ (asümptoodid on teljed); $y=\dfrac{k}{x-m}+n$: asümptoodid $x=m$ ja $y=n$ — *pähe*`,
      ],
      ru_hint: [
        'Уравнений окружности, параболы и гиперболы на листе формул lai нет.',
        'x² − 4x = (x − 2)² − 4: выделяем полный квадрат, чтобы найти центр и радиус.',
        'Если после выделения справа получилось отрицательное число или 0 — это не окружность.',
      ],
      example: {
        task: r`Leia ringjoone $x^2+y^2-4x+6y-12=0$ keskpunkt ja raadius.`,
        steps: [
          r`$x^2-4x=(x-2)^2-4$, $\;y^2+6y=(y+3)^2-9$.`,
          r`$(x-2)^2-4+(y+3)^2-9-12=0$, $\;(x-2)^2+(y+3)^2=25$.`,
          r`Keskpunkt $K(2;-3)$, raadius $r=5$.`,
        ],
        graph: { fns: 'y = -3 + sqrt(25 - (x - 2)^2)\ny = -3 - sqrt(25 - (x - 2)^2)', xmin: -4, xmax: 8, ymin: -9, ymax: 3, step: 1, stepY: 1, points: 'K(2; -3)' },
      },
      practice: [
        { title: 'Ringjoone võrrand.', parts: [
          [r`Koosta ringjoone võrrand, mille keskpunkt on $(-1;3)$ ja mis läbib punkti $(2;7)$.`, 2, '(x+1)^2+(y-3)^2=25|(x+1)²+(y-3)²=25', r`$r^2=3^2+4^2=25$: $(x+1)^2+(y-3)^2=25$`],
          [r`Kas punkt $(3;0)$ asub sellel ringjoonel? Kirjuta jah või ei.`, 1, 'jah', r`$(3+1)^2+(0-3)^2=16+9=25$ — asub.`, 1],
          [r`Koosta ringjoone võrrand, mille läbimõõdu otspunktid on $A(-3;1)$ ja $B(5;7)$.`, 2, '(x-1)^2+(y-4)^2=25|(x-1)²+(y-4)²=25', r`Keskpunkt $(1;4)$, $r=\dfrac12\sqrt{8^2+6^2}=5$: $(x-1)^2+(y-4)^2=25$`],
        ] },
        { title: r`Antud on võrrand $x^2+y^2+8x-2y+8=0$.`, parts: [
          ['Leia ringjoone keskpunkt.', 2, '(-4;1)|-4;1', r`$(x+4)^2-16+(y-1)^2-1+8=0$, $\;(x+4)^2+(y-1)^2=9$`],
          ['Leia raadius.', 1, '3', r`$r=\sqrt9=3$`, 1],
          [r`Kas võrrand $x^2+y^2-6x+10=0$ on ringjoone võrrand? Kirjuta jah või ei.`, 2, 'ei', r`$(x-3)^2+y^2=9-10=-1<0$ — ükski punkt seda ei rahulda.`],
        ] },
        { title: r`Parabool $y=2x^2-8x+3$.`, parts: [
          ['Leia haripunkt.', 1, '(2;-5)|2;-5', r`$x_0=\dfrac{8}{4}=2$, $\;y_0=8-16+3=-5$`, 1],
          ['Kirjuta parabooli võrrand haripunktikujul.', 1, 'y=2(x-2)^2-5|2(x-2)^2-5|y=2(x-2)²-5|2(x-2)²-5', r`$y=2(x^2-4x+4)-8+3=2(x-2)^2-5$`, 1],
          [r`Parabooli haripunkt on $(1;1)$ ja ta läbib punkti $(0;3)$. Koosta võrrand kujul $y=ax^2+bx+c$.`, 2, 'y=2x^2-4x+3|2x^2-4x+3|y=2x²-4x+3|2x²-4x+3', r`$y=a(x-1)^2+1$; $\;3=a+1$, $a=2$: $y=2x^2-4x+3$`],
        ] },
        { title: 'Hüperbool.', parts: [
          [r`Hüperbool $y=\dfrac kx$ läbib punkti $(-2;6)$. Leia $k$.`, 1, '-12', r`$6=\dfrac{k}{-2}$, $k=-12$`, 1],
          [r`Leia selle hüperbooli väärtus kohal $x=3$.`, 1, '-4', r`$y=\dfrac{-12}{3}=-4$`, 1],
          [r`Kirjuta hüperbooli $y=\dfrac{6}{x-1}+2$ asümptoodid.`, 2, 'x=1; y=2', r`Püstasümptoot $x=1$ (nimetaja null), rõhtasümptoot $y=2$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on ringjoon $x^2+y^2-2x-4y-20=0$.`, grid: { xmin: -5, xmax: 7, ymin: -4, ymax: 8, step: 1, stepY: 1, blank: true }, parts: [
        ['Leia ringjoone keskpunkt K.', 2, '(1;2)|1;2', r`$(x-1)^2-1+(y-2)^2-4-20=0$, $\;(x-1)^2+(y-2)^2=25$: $K(1;2)$`, 3],
        ['Leia raadius.', 1, '5', r`$r=\sqrt{25}=5$`, 1],
        [r`Leia ringjoone ja $y$-telje lõikepunktide ordinaadid.`, 2, '2+2√6; 2-2√6|6,90; -2,90', r`$x=0$: $1+(y-2)^2=25$, $\;y-2=\pm\sqrt{24}=\pm2\sqrt6$, $\;y=2\pm2\sqrt6\approx6{,}90$ või $-2{,}90$`, 3],
        [r`Kas punkt $P(4;6)$ asub ringjoonel? Kirjuta jah või ei.`, 1, 'jah', r`$(4-1)^2+(6-2)^2=9+16=25$ — asub.`, 1],
        ['Joonesta ringjoon ja punkt P.', 2, '', 'Keskpunkt (1; 2), raadius 5 sirkliga; P(4; 6) on ringjoonel.', 0],
        [r`Koosta ringjoone puutuja võrrand punktis $P$.`, 2, 'y=-0,75x+9|-0,75x+9|3x+4y-36=0|y=-3/4x+9|-3/4x+9', r`Puutuja on risti raadiusega $\overrightarrow{KP}=(3;4)$, mis on normaalvektor: $3(x-4)+4(y-6)=0$, $\;3x+4y-36=0$`, 3],
      ] },
      self: ['Koostan ringjoone võrrandi keskpunkti ja raadiuse järgi.', 'Täiendan täisruuduks ja leian keskpunkti.', 'Leian parabooli haripunkti ja hüperbooli asümptoodid.'],
    },
    {
      title: 'Joonte lõikepunktid',
      ru: 'Точки пересечения линий',
      course: 'V',
      exam: 'Riigieksamil leitakse lõikepunktid funktsiooni- ja integraaliülesannetes ning puutuja tingimus parameetriga.',
      can: 'Õpilane leiab sirge ja ringjoone, parabooli või hüperbooli lõikepunktid ning puutumise tingimuse diskriminandi abil.',
      theory: [
        r`Joonte ühised punktid on nende võrrandite süsteemi lahendid — *pähe*`,
        r`Sirge ja ringjoon (parabool): asendus $\to$ ruutvõrrand; $D>0$ — kaks lõikepunkti, $D=0$ — puutuvad, $D<0$ — ühiseid punkte pole — *pähe*`,
        r`Sirge ja hüperbool $y=\dfrac kx$: korruta $x$-ga ($x\ne0$) — *pähe*`,
        r`Ruutvõrrand $ax^2+bx+c=0$: $D=b^2-4ac$, $x=\dfrac{-b\pm\sqrt D}{2a}$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai этого нет: точки пересечения — это решения системы уравнений.',
        'Касание: после подстановки получаем квадратное уравнение с D = 0.',
        'Не забудь найти y для каждого найденного x.',
      ],
      example: {
        task: r`Leia sirge $y=x+1$ ja parabooli $y=x^2-2x-3$ lõikepunktid.`,
        steps: [
          r`$x^2-2x-3=x+1$, $\;x^2-3x-4=0$, $\;D=9+16=25$.`,
          r`$x=\dfrac{3\pm5}{2}$: $x_1=4$, $x_2=-1$.`,
          r`$y_1=5$, $y_2=0$. Lõikepunktid $(4;5)$ ja $(-1;0)$.`,
        ],
        graph: { fns: 'y = x^2 - 2x - 3\ny = x + 1', xmin: -3, xmax: 6, ymin: -5, ymax: 8, step: 1, stepY: 1, points: 'A(-1; 0)\nB(4; 5)' },
      },
      practice: [
        { title: r`Leia sirge $y=2x-1$ ja ringjoone $x^2+y^2=13$ lõikepunktid.`, parts: [
          ['Lõikepunktid', 4, '(2;3); (-1,2;-3,4)|2;3; -1,2;-3,4', r`$x^2+(2x-1)^2=13$, $\;5x^2-4x-12=0$, $D=16+240=256$, $x=\dfrac{4\pm16}{10}$: $x=2$, $y=3$ või $x=-1{,}2$, $y=-3{,}4$`, 5],
        ] },
        { title: r`Leia hüperbooli $y=\dfrac6x$ ja sirge $y=x+1$ lõikepunktid.`, parts: [
          ['Lõikepunktid', 3, '(2;3); (-3;-2)|2;3; -3;-2', r`$\dfrac6x=x+1$, $x\ne0$: $x^2+x-6=0$, $x=2$ või $x=-3$; $y=3$ või $y=-2$`, 4],
        ] },
        { title: r`Sirge $y=x+b$ ja parabool $y=x^2-3x+2$.`, parts: [
          [r`Leia $b$, mille korral sirge puutub parabooli.`, 2, '-2', r`$x^2-4x+2-b=0$, $\;D=16-4(2-b)=8+4b=0$, $b=-2$`],
          ['Leia puutepunkt.', 1, '(2;0)|2;0', r`$x^2-4x+4=0$, $x=2$, $y=2-2=0$`, 1],
          [r`Milliste $b$ korral on sirgel ja paraboolil kaks ühist punkti?`, 1, 'b>-2|(-2;∞)|(-2;inf)', r`$D=8+4b>0$, $b>-2$`, 1],
        ] },
        { title: r`Sirge $y=kx$ ja ringjoon $(x-5)^2+y^2=9$.`, parts: [
          [r`Leia $k$, mille korral sirge puutub ringjoont.`, 3, '0,75; -0,75|3/4; -3/4', r`$(1+k^2)x^2-10x+16=0$, $\;D=100-64(1+k^2)=36-64k^2=0$, $k=\pm\dfrac34$`, 4],
          [r`Mitu ühist punkti on sirgel $y=x$ ja sellel ringjoonel?`, 1, '0', r`$k=1$: $D=36-64<0$ — ühiseid punkte ei ole.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on parabool $y=x^2-4x+1$ ja sirge $y=2x-4$.`, grid: { xmin: -2, xmax: 7, ymin: -5, ymax: 10, step: 1, stepY: 1, blank: true }, parts: [
        ['Leia parabooli ja sirge lõikepunktid.', 3, '(1;-2); (5;6)|1;-2; 5;6', r`$x^2-4x+1=2x-4$, $\;x^2-6x+5=0$, $x=1$ või $x=5$; $y=-2$ või $y=6$`, 4],
        ['Joonesta parabool ja sirge ning märgi lõikepunktid.', 2, '', 'Parabooli haripunkt (2; −3), nullkohad 2 ± √3; sirge läbib punkte (1; −2) ja (5; 6).', 0],
        [r`Leia $c$, mille korral sirge $y=2x+c$ puutub parabooli.`, 3, '-8', r`$x^2-6x+1-c=0$, $\;D=36-4(1-c)=32+4c=0$, $c=-8$`, 3],
        ['Leia puutepunkt.', 2, '(3;-2)|3;-2', r`$x^2-6x+9=0$, $x=3$, $y=2\cdot3-8=-2$ (kontroll: $9-12+1=-2$)`, 2],
      ] },
      self: ['Leian lõikepunktid süsteemi lahendades.', 'Kasutan diskriminanti puutumise tingimusena.', 'Leian iga x jaoks ka y.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: V kursus',
      ru: 'Повторение и контрольная работа: V курс',
      course: 'V',
      exam: 'Kontrolltöö on samas vormis nagu riigieksami II osa analüütilise geomeetria ülesanne: vektor, sirge, ringjoon, lõikepunktid.',
      can: 'Õpilane lahendab V kursuse põhiülesandeid iseseisvalt ja kirjutab lahenduskäigu.',
      theory: [
        r`$|AB|=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$, $\;M\left(\dfrac{x_1+x_2}2;\dfrac{y_1+y_2}2\right)$, $\;\overrightarrow{AB}=(x_2-x_1;y_2-y_1)$ — *pähe*`,
        r`$\vec a\cdot\vec b=a_xb_x+a_yb_y=|\vec a||\vec b|\cos\varphi$; risti $\vec a\cdot\vec b=0$; kollineaarsed $\dfrac{a_x}{b_x}=\dfrac{a_y}{b_y}$ — *pähe*`,
        r`$y-y_1=k(x-x_1)$; paralleelsed $k_1=k_2$, risti $k_1k_2=-1$ — *pähe*`,
        r`$(x-a)^2+(y-b)^2=r^2$; lõikepunktid süsteemist, puutumine $D=0$ — *pähe*`,
        r`$\sin^2\varphi+\cos^2\varphi=1$ — *valemilehel*`,
      ],
      ru_hint: [
        'Контрольная: 25 баллов, 45 минут. Формул этого курса на листе формул нет, кроме sin² + cos² = 1.',
        'Пиши все шаги: балл даётся за каждый верный шаг.',
        'Сделай набросок в системе координат — он помогает проверить ответ.',
      ],
      example: {
        task: r`Koosta punkti $(2;3)$ läbiva ja sirgega $y=-2x+5$ risti oleva sirge võrrand.`,
        steps: [
          r`Ristsirge tõus $k=-\dfrac{1}{-2}=0{,}5$.`,
          r`$y-3=0{,}5(x-2)$, $\;y=0{,}5x+2$.`,
        ],
      },
      practice: [
        { title: r`$A(-1;4)$ ja $B(5;-4)$.`, parts: [
          [r`Leia $|AB|$.`, 1, '10', r`$\sqrt{36+64}=10$`, 1],
          ['Leia lõigu AB keskpunkt.', 1, '(2;0)|2;0', r`$\left(\dfrac{-1+5}2;\dfrac{4-4}2\right)=(2;0)$`, 1],
        ] },
        { title: r`$\vec a=(1;2)$ ja $\vec b=(4;-2)$.`, parts: [
          [r`Leia $\vec a\cdot\vec b$.`, 1, '0', r`$4-4=0$`, 1],
          [r`Leia $|2\vec a+\vec b|$.`, 2, '2√10|2sqrt(10)|√40|6,32', r`$2\vec a+\vec b=(6;2)$, $\;\sqrt{40}=2\sqrt{10}\approx6{,}32$`],
        ] },
        { title: r`Sirge $y=-2x+5$.`, parts: [
          [r`Koosta sellega paralleelse ja punkti $(2;3)$ läbiva sirge võrrand.`, 1, 'y=-2x+7|-2x+7|2x+y-7=0', r`$y-3=-2(x-2)$, $\;y=-2x+7$`, 1],
          [r`Koosta sellega risti oleva ja punkti $(2;3)$ läbiva sirge võrrand.`, 1, 'y=0,5x+2|0,5x+2|x-2y+4=0', r`$k=0{,}5$: $y=0{,}5x+2$`, 1],
        ] },
        { title: r`Ringjoon $x^2+y^2+6x-8y=0$.`, parts: [
          ['Leia keskpunkt.', 1, '(-3;4)|-3;4', r`$(x+3)^2+(y-4)^2=25$`, 1],
          ['Leia raadius.', 1, '5', r`$r=5$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'V kursus: vektor tasandil, joone võrrand. Aega 45 minutit.', parts: [
        [r`1. Antud on $A(-2;3)$ ja $B(4;-5)$. Leia $|AB|$.`, 2, '10', r`$\sqrt{6^2+8^2}=10$`, 2],
        [r`2. Leia lõigu $AB$ keskpunkt $M$.`, 2, '(1;-1)|1;-1', r`$\left(\dfrac{-2+4}2;\dfrac{3-5}2\right)=(1;-1)$`, 2],
        [r`3. $\vec a=(3;-1)$ ja $\vec b=(2;3)$. Leia $2\vec a-\vec b$.`, 2, '(4;-5)|4;-5', r`$(6;-2)-(2;3)=(4;-5)$`, 2],
        [r`4. Leia vektorite $\vec a$ ja $\vec b$ vaheline nurk kahe kümnendkohani.`, 3, '74,74', r`$\vec a\cdot\vec b=6-3=3$; $\;\cos\varphi=\dfrac{3}{\sqrt{10}\cdot\sqrt{13}}=\dfrac{3}{\sqrt{130}}$, $\;\varphi\approx74{,}74^\circ$`, 3],
        [r`5. Leia $m$, mille korral vektor $\vec c=(m;6)$ on kollineaarne vektoriga $\vec a$.`, 2, '-18', r`$\dfrac m3=\dfrac{6}{-1}$, $m=-18$`, 2],
        [r`6. Koosta sirge $AB$ võrrand.`, 3, '4x+3y-1=0|y=-4/3x+1/3|-4/3x+1/3', r`$k=\dfrac{-5-3}{4+2}=-\dfrac43$; $\;y-3=-\dfrac43(x+2)$, $\;3y-9=-4x-8$, $\;4x+3y-1=0$`, 3],
        [r`7. Koosta lõigu $AB$ keskristsirge võrrand.`, 3, '3x-4y-7=0|y=0,75x-1,75|0,75x-1,75', r`Läbib $M(1;-1)$, tõus $\dfrac34$: $y+1=\dfrac34(x-1)$, $\;4y+4=3x-3$, $\;3x-4y-7=0$`, 3],
        [r`8. Koosta ringjoone võrrand, mille keskpunkt on $M$ ja mis läbib punkti $A$.`, 2, '(x-1)^2+(y+1)^2=25|(x-1)²+(y+1)²=25', r`$r=|MA|=\sqrt{9+16}=5$: $(x-1)^2+(y+1)^2=25$`, 2],
        [r`9. Leia selle ringjoone ja sirge $y=x+5$ lõikepunktid.`, 4, '(-2;3); (-3;2)|-2;3; -3;2', r`$(x-1)^2+(x+6)^2=25$, $\;2x^2+10x+12=0$, $\;x^2+5x+6=0$: $x=-2$, $y=3$ või $x=-3$, $y=2$`, 4],
        [r`10. Kas ülesannete 6 ja 7 sirged on risti? Kirjuta jah või ei.`, 2, 'jah', r`Normaalvektorid $(4;3)$ ja $(3;-4)$: $12-12=0$ — risti (keskristsirge on alati risti).`, 1],
      ] },
      self: ['Oskan V kursuse kõiki ülesandetüüpe.', 'Kirjutan iga sammu.', 'Kontrollin vastuse joonise abil.'],
    },

  ],
};
