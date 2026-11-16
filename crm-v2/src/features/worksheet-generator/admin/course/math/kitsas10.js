// Matemaatika kitsas, 10. klass (owner 2026-11-16: „срочно делаем курс по математике с 10 по 12 класс и экзамены”).
// Gümnaasiumi kitsa matemaatika kursused I–III (GRÕK lisa 5 p 2.2.2; paigutus 10. klassi on meie otsus, vt
// docs/CURRICULUM_MATEMAATIKA_1_12.md): I „Arvuhulgad. Avaldised. Võrrandid ja võrratused”, II „Trigonomeetria”,
// III „Vektor tasandil. Joone võrrand”. Built step by step from the basics, not exam-only; after every course a
// „Kordamine ja kontrolltöö” lesson whose third sheet is a 25-point test. Every task is our own.
// The lesson shape is the one of kitsas12.js (math/sheets.js builds three sheets per lesson):
// theory (formulas to know), a short Russian hint, a worked example (with a graph where it helps), four practice tasks
// with answers and worked solutions, one larger task (5 or 10 p; 25 p in a test lesson).
// Text is Markdown + $…$ formulas (KaTeX); r`…` keeps the backslashes of LaTeX.
// A part: [text, points, answer, solution, rows?] — answer '' means the teacher judges it (a drawing, an explanation);
// several right forms are separated by |, several answers by ; (engine/mathExpr.js sameMathAnswer).
const r = String.raw;

export const KITSAS_10 = {
  id: 'mk10',
  title: 'Matemaatika kitsas: 10. klass',
  // the library level (Õppevara → Matemaatika, libraryModel.subjectOfLevel); the sheet's level box shows the short one
  level: '10. klass matemaatika kitsas',
  sheetLevel: 'Kitsas 10',
  minutes: 90,
  // the teacher's plan in mathCurriculum.js: a school course lesson, not exam prep
  plan: 'course',
  phases: {
    transfer: { label: '3 Kontrollülesanne', slot: 3, subtitle: 'Suurem ülesanne nagu kontrolltöös: kirjuta kogu lahenduskäik.' },
  },
  goal: 'Õpilane lahendab võrrandeid ja võrratusi, teisendab avaldisi, lahendab kolmnurki trigonomeetria abil ning kasutab vektoreid, sirge ja ringjoone võrrandit.',
  lessons: [
    // ───────────── I kursus „Arvuhulgad. Avaldised. Võrrandid ja võrratused” ─────────────
    {
      title: 'Hulgad, arvuhulgad ja absoluutväärtus',
      ru: 'Множества, числовые множества и модуль',
      course: 'I',
      exam: 'Vahemikud ja absoluutväärtus on iga võrratuse vastuses; riigieksamil kirjutatakse vastus vahemikuna.',
      can: 'Õpilane leiab hulkade ühendi ja ühisosa, liigitab arvud arvuhulkadesse, kirjutab vahemiku ja lahendab lihtsa absoluutväärtusega võrrandi ja võrratuse.',
      theory: [
        r`Ühend $A\cup B$: elemendid, mis on $A$-s **või** $B$-s. Ühisosa $A\cap B$: elemendid, mis on **mõlemas**. $A\subset B$: $A$ on $B$ osahulk.`,
        r`$\mathbb N\subset\mathbb Z\subset\mathbb Q\subset\mathbb R$; irratsionaalarvud $\mathbb I$ (nt $\sqrt2$, $\pi$); $\mathbb R=\mathbb Q\cup\mathbb I$.`,
        r`Vahemik $(a;b)$: $a<x<b$; $\;$ lõik $[a;b]$: $a\le x\le b$; $\;[a;\infty)$: $x\ge a$.`,
        r`$|a|=a$, kui $a\ge0$; $\;|a|=-a$, kui $a<0$. $\;|x-a|$ on punktide $x$ ja $a$ kaugus arvteljel.`,
        r`$|x|<r\;\Leftrightarrow\;-r<x<r$; $\;|x|>r\;\Leftrightarrow\;x<-r$ või $x>r$.`,
      ],
      ru_hint: [
        'Объединение ∪ — всё, что есть хотя бы в одном множестве; пересечение ∩ — только общее.',
        'Круглая скобка — конец не входит, квадратная — входит. У бесконечности всегда круглая.',
        '|x − a| — это расстояние от x до a на числовой оси.',
      ],
      example: {
        task: r`Lahenda võrratus $|x-1|<2$.`,
        steps: [
          r`$|x-1|$ on kaugus punktist $1$: see peab olema väiksem kui $2$.`,
          r`$-2<x-1<2$; liidame igale osale $1$: $-1<x<3$.`,
          r`Graafikul on $y=|x-1|$ sirgest $y=2$ allpool punktide $A$ ja $B$ vahel. Vastus: $(-1;3)$.`,
        ],
        graph: { fns: 'y = abs(x - 1)\ny = 2', xmin: -3, xmax: 5, ymin: -1, ymax: 4, step: 1, points: 'A(-1; 2)\nB(3; 2)' },
      },
      practice: [
        { title: r`$A=\{1;2;3;4;6\}$ ja $B=\{2;4;6;8\}$. Kirjuta elemendid semikooloniga.`, parts: [
          [r`$A\cup B$`, 1, '1; 2; 3; 4; 6; 8', r`Kõik elemendid, mis on vähemalt ühes hulgas: $\{1;2;3;4;6;8\}$.`, 1],
          [r`$A\cap B$`, 1, '2; 4; 6', r`Ühised elemendid: $\{2;4;6\}$.`, 1],
          [r`Kas $A\subset B$? Kirjuta jah või ei.`, 1, 'ei', r`$1\in A$, aga $1\notin B$, seega $A$ ei ole $B$ osahulk.`, 0],
        ] },
        { title: r`Arvud: $-3$; $\;0{,}5$; $\;\sqrt9$; $\;\sqrt7$; $\;\pi$; $\;\frac23$; $\;12$.`, parts: [
          ['Kirjuta naturaalarvud.', 1, '3; 12|√9; 12', r`$\sqrt9=3$ ja $12$ on naturaalarvud.`, 1],
          ['Kirjuta täisarvud.', 1, '-3; 3; 12|-3; √9; 12', r`Täisarvud: $-3$, $\sqrt9=3$, $12$.`, 1],
          ['Kirjuta irratsionaalarvud.', 1, '√7; π|√7; pi|sqrt(7); pi', r`$\sqrt7$ ja $\pi$ ei ole murruna kirjutatavad; $0{,}5=\frac12$ ja $\frac23$ on ratsionaalarvud.`, 1],
        ] },
        { title: r`$A=[-1;4]$ ja $B=(2;6)$.`, parts: [
          [r`Leia $A\cap B$.`, 2, '(2;4]|2<x<=4|2<x≤4', r`Mõlemas on arvud $2<x\le4$: $(2;4]$ ($2$ ei kuulu $B$-sse, $4$ kuulub $A$-sse).`, 2],
          [r`Leia $A\cup B$.`, 2, '[-1;6)|-1<=x<6|-1≤x<6', r`Hulgad katavad kokku lõigu $-1\le x<6$: $[-1;6)$.`, 2],
        ] },
        { title: 'Absoluutväärtus.', parts: [
          [r`Arvuta $|-7|+|3-5|$.`, 1, '9', r`$7+|-2|=7+2=9$`, 1],
          [r`Lahenda $|x-3|=5$.`, 2, '8; -2', r`$x-3=5$ või $x-3=-5$: $x=8$ või $x=-2$.`],
          [r`Lahenda $|x+1|\le4$.`, 2, '-5<=x<=3|-5≤x≤3|[-5;3]', r`$-4\le x+1\le4$, seega $-5\le x\le3$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`$A=\{x\in\mathbb R\mid |x-2|<3\}$ ja $B=[0;7]$.`, parts: [
        [r`Kirjuta hulk $A$ vahemikuna.`, 2, '(-1;5)|-1<x<5', r`$-3<x-2<3$, seega $-1<x<5$: $A=(-1;5)$.`, 3],
        [r`Leia $A\cap B$.`, 1, '[0;5)|0<=x<5|0≤x<5', r`Ühine osa: $0\le x<5$, s.t $[0;5)$.`, 2],
        [r`Leia $A\cup B$.`, 1, '(-1;7]|-1<x<=7|-1<x≤7', r`Kokku: $-1<x\le7$, s.t $(-1;7]$.`, 2],
        [r`Mitu täisarvu on hulgas $A\cap B$?`, 1, '5', r`$0,1,2,3,4$ — viis täisarvu.`, 1],
      ] },
      self: ['Leian hulkade ühendi ja ühisosa.', 'Kirjutan vahemiku sulgudega õigesti.', 'Lahendan |x − a| < r kahe võrratusena.'],
    },
    {
      title: 'Standardkuju, astmed ja juured',
      ru: 'Стандартный вид, степени и корни',
      course: 'I',
      exam: 'Astmete ja juurte reeglid on igas avaldise ülesandes; valemilehel neid ei ole.',
      can: 'Õpilane kirjutab arvu standardkujul, arvutab ratsionaalarvulise astendajaga astme ja lihtsustab juuri.',
      theory: [
        r`Standardkuju: $a\cdot10^n$, kus $1\le a<10$ ja $n\in\mathbb Z$ (nt $0{,}0032=3{,}2\cdot10^{-3}$).`,
        r`$a^m\cdot a^n=a^{m+n}$, $\;a^m:a^n=a^{m-n}$, $\;(a^m)^n=a^{mn}$, $\;(ab)^n=a^nb^n$`,
        r`$a^0=1$, $\;a^{-n}=\dfrac{1}{a^n}$, $\;a^{\frac mn}=\sqrt[n]{a^m}$`,
        r`$\sqrt{ab}=\sqrt a\cdot\sqrt b$, $\;\sqrt{\dfrac ab}=\dfrac{\sqrt a}{\sqrt b}$; $\;\sqrt{a^2}=|a|$`,
      ],
      ru_hint: [
        'Отрицательная степень — это дробь: 2⁻³ = 1/8. Дробная степень — это корень: 8^(2/3) = (∛8)².',
        'Из-под корня выносим полный квадрат: √50 = √(25·2) = 5√2.',
        'Стандартный вид: перед 10ⁿ стоит число от 1 до 10.',
      ],
      example: {
        task: r`Arvuta $\dfrac{27^{\frac23}\cdot3^{-1}}{\sqrt[4]{81}}$.`,
        steps: [
          r`$27^{\frac23}=\left(\sqrt[3]{27}\right)^2=3^2=9$; $\;3^{-1}=\dfrac13$; $\;\sqrt[4]{81}=3$.`,
          r`$\dfrac{9\cdot\frac13}{3}=\dfrac{3}{3}=1$.`,
          r`Teine tee: kõik on $3$ astmed: $3^{2}\cdot3^{-1}:3^{1}=3^{0}=1$.`,
        ],
      },
      practice: [
        { title: 'Kirjuta standardkujul.', parts: [
          [r`$0{,}000045$`, 1, '4,5·10^-5|4,5*10^-5|4,5·10^(-5)|4,5*10^(-5)', r`Koma liigub 5 kohta paremale: $4{,}5\cdot10^{-5}$.`, 1],
          [r`$3\,200\,000$`, 1, '3,2·10^6|3,2*10^6', r`Koma liigub 6 kohta vasakule: $3{,}2\cdot10^{6}$.`, 1],
          [r`$(2{,}5\cdot10^{4})\cdot(6\cdot10^{-7})$`, 2, '1,5·10^-2|1,5*10^-2|1,5·10^(-2)|1,5*10^(-2)', r`$2{,}5\cdot6=15$, $10^{4-7}=10^{-3}$: $15\cdot10^{-3}=1{,}5\cdot10^{-2}$.`],
        ] },
        { title: 'Arvuta.', parts: [
          [r`$16^{\frac34}$`, 1, '8', r`$\left(\sqrt[4]{16}\right)^3=2^3=8$`, 1],
          [r`$\left(\dfrac{8}{27}\right)^{-\frac13}$`, 2, '1,5|3/2', r`$\left(\dfrac{27}{8}\right)^{\frac13}=\dfrac{3}{2}=1{,}5$`],
          [r`$5^{-2}\cdot5^{4}$`, 1, '25', r`$5^{-2+4}=5^2=25$`, 1],
          [r`$\sqrt[3]{-125}$`, 1, '-5', r`$(-5)^3=-125$, seega $\sqrt[3]{-125}=-5$.`, 1],
        ] },
        { title: 'Lihtsusta.', parts: [
          [r`$\sqrt{50}$`, 1, '5√2|5sqrt(2)|5*sqrt(2)', r`$\sqrt{25\cdot2}=5\sqrt2$`, 1],
          [r`$\sqrt{12}+\sqrt{27}$`, 2, '5√3|5sqrt(3)|5*sqrt(3)', r`$2\sqrt3+3\sqrt3=5\sqrt3$`],
          [r`$\sqrt{18}\cdot\sqrt2$`, 1, '6', r`$\sqrt{36}=6$`, 1],
        ] },
        { title: r`Lihtsusta ($a>0$).`, parts: [
          [r`$a^{\frac12}\cdot a^{\frac32}$`, 1, 'a^2|a²', r`$a^{\frac12+\frac32}=a^2$`, 1],
          [r`$\dfrac{a^5\cdot a^{-2}}{a^4}$`, 2, '1/a|a^-1|a^(-1)', r`$a^{5-2-4}=a^{-1}=\dfrac1a$`],
          [r`$\sqrt[3]{a^6}$`, 1, 'a^2|a²', r`$a^{\frac63}=a^2$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Valguse kiirus on umbes $3\cdot10^8$ m/s. Päikese kaugus Maast on umbes $1{,}5\cdot10^{11}$ m.`, parts: [
        ['Mitu sekundit kulub valgusel Päikeselt Maale?', 2, '500|5·10^2|5*10^2', r`$t=\dfrac{s}{v}=\dfrac{1{,}5\cdot10^{11}}{3\cdot10^8}=0{,}5\cdot10^{3}=500$ s`, 3],
        ['Väljenda see aeg minutites kahe kümnendkohani.', 1, '8,33', r`$500:60\approx8{,}33$ min`, 1],
        ['Valgusaasta on teepikkus, mille valgus läbib 365 päevaga. Kirjuta see meetrites standardkujul kahe kümnendkohaga.', 2, '9,46·10^15|9,46*10^15',
          r`$365\cdot24\cdot3600=31\,536\,000=3{,}1536\cdot10^7$ s; $\;3\cdot10^8\cdot3{,}1536\cdot10^7\approx9{,}46\cdot10^{15}$ m`, 3],
      ] },
      self: ['Kirjutan arvu standardkujul.', 'Arvutan murdastendajaga astme juure kaudu.', 'Toon teguri juure alt välja.'],
    },
    {
      title: 'Ratsionaal- ja irratsionaalavaldiste teisendamine',
      ru: 'Преобразование рациональных и иррациональных выражений',
      course: 'I',
      exam: 'Riigieksami I osa 5-punktiline ülesanne: lihtsusta avaldis ja arvuta väärtus.',
      can: 'Õpilane kasutab korrutamise abivalemeid, tegurdab, liidab ja korrutab murde ning vabastab murru nimetaja juurest.',
      theory: [
        r`$(a\pm b)^2=a^2\pm2ab+b^2$, $\;(a-b)(a+b)=a^2-b^2$`,
        r`Tegurdamine: ühine tegur sulgude ette; $\;ax^2+bx+c=a(x-x_1)(x-x_2)$`,
        r`Murdude liitmine: ühine nimetaja; korrutamine: lugeja lugejaga, nimetaja nimetajaga; jagamine: korruta pöördarvuga.`,
        r`Nimetaja juurest: $\dfrac{a}{\sqrt b}=\dfrac{a\sqrt b}{b}$; $\;\dfrac{1}{\sqrt a-\sqrt b}=\dfrac{\sqrt a+\sqrt b}{a-b}$`,
      ],
      ru_hint: [
        'Сначала раскладываем на множители, потом сокращаем — только множители, не слагаемые.',
        'Чтобы убрать корень из знаменателя, умножаем на сопряжённое: (√a − √b)(√a + √b) = a − b.',
        'Формулы сокращённого умножения на экзамене не даются.',
      ],
      example: {
        task: r`Lihtsusta $\dfrac{x}{x-2}-\dfrac{4}{x^2-2x}$.`,
        steps: [
          r`Tegurda nimetaja: $x^2-2x=x(x-2)$. Ühine nimetaja on $x(x-2)$.`,
          r`$\dfrac{x\cdot x-4}{x(x-2)}=\dfrac{x^2-4}{x(x-2)}=\dfrac{(x-2)(x+2)}{x(x-2)}$`,
          r`Taanda $(x-2)$: vastus $\dfrac{x+2}{x}$ (kui $x\ne0$, $x\ne2$).`,
        ],
      },
      practice: [
        { title: 'Ava sulud ja koonda.', parts: [
          [r`$(2x-3)^2$`, 1, '4x^2-12x+9|4x²-12x+9', r`$4x^2-2\cdot2x\cdot3+9=4x^2-12x+9$`, 2],
          [r`$(x+5)(x-5)$`, 1, 'x^2-25|x²-25', r`Ruutude vahe: $x^2-25$.`, 1],
          [r`$(a+2b)^2-4ab$`, 2, 'a^2+4b^2|a²+4b²', r`$a^2+4ab+4b^2-4ab=a^2+4b^2$`],
        ] },
        { title: 'Tegurda.', parts: [
          [r`$3x^2-12$`, 1, '3(x-2)(x+2)|3(x+2)(x-2)', r`$3(x^2-4)=3(x-2)(x+2)$`, 2],
          [r`$x^2+6x+9$`, 1, '(x+3)^2|(x+3)²', r`Täisruut: $(x+3)^2$.`, 1],
          [r`$2x^2-x-1$`, 2, '(x-1)(2x+1)|(2x+1)(x-1)', r`$2x^2-x-1=0$: $x_1=1$, $x_2=-\frac12$; $2(x-1)\left(x+\frac12\right)=(x-1)(2x+1)$.`],
        ] },
        { title: 'Lihtsusta.', parts: [
          [r`$\dfrac{x^2-25}{2x+10}$`, 2, '(x-5)/2|x/2-5/2', r`$\dfrac{(x-5)(x+5)}{2(x+5)}=\dfrac{x-5}{2}$`],
          [r`$\dfrac1x+\dfrac1{x+1}$`, 2, '(2x+1)/(x(x+1))|(2x+1)/(x^2+x)', r`$\dfrac{x+1+x}{x(x+1)}=\dfrac{2x+1}{x(x+1)}$`],
          [r`$\dfrac{a^2-1}{a}\cdot\dfrac{a^2}{a+1}$`, 2, 'a(a-1)|a^2-a|a²-a', r`$\dfrac{(a-1)(a+1)\cdot a^2}{a(a+1)}=a(a-1)$`],
        ] },
        { title: 'Vabasta nimetaja juurest või arvuta täpselt.', parts: [
          [r`$\dfrac{6}{\sqrt3}$`, 1, '2√3|2sqrt(3)|2*sqrt(3)', r`$\dfrac{6\sqrt3}{3}=2\sqrt3$`, 1],
          [r`$\dfrac{2}{\sqrt5-1}$`, 2, '(√5+1)/2|(1+√5)/2|(sqrt(5)+1)/2', r`$\dfrac{2(\sqrt5+1)}{(\sqrt5-1)(\sqrt5+1)}=\dfrac{2(\sqrt5+1)}{4}=\dfrac{\sqrt5+1}{2}$`],
          [r`$(\sqrt7-\sqrt3)(\sqrt7+\sqrt3)$`, 1, '4', r`$7-3=4$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Antud on avaldis $\left(\dfrac{x+1}{x-1}-\dfrac{x-1}{x+1}\right)\cdot\dfrac{x^2-1}{2}$.`, parts: [
        ['Lihtsusta avaldis.', 3, '2x', r`Ühine nimetaja $x^2-1$: $\dfrac{(x+1)^2-(x-1)^2}{x^2-1}=\dfrac{4x}{x^2-1}$. Korrutades $\dfrac{x^2-1}{2}$-ga: $2x$.`, 6],
        [r`Arvuta avaldise väärtus, kui $x=\sqrt3$.`, 2, '2√3|2sqrt(3)|3,46', r`$2\sqrt3\approx3{,}46$`, 2],
      ] },
      self: ['Kasutan abivalemeid mõlemas suunas.', 'Leian murdude ühise nimetaja.', 'Vabastan nimetaja juurest.'],
    },
    {
      title: 'Lineaar- ja ruutvõrrandid',
      ru: 'Линейные и квадратные уравнения',
      course: 'I',
      exam: 'Ruutvõrrand on peaaegu iga riigieksami ülesande sees (nullkohad, lõikepunktid, tekstülesanne).',
      can: 'Õpilane eristab võrdust, samasust ja võrrandit, lahendab lineaar- ja ruutvõrrandi ning kasutab Viète\'i teoreemi.',
      theory: [
        r`Samasus kehtib iga $x$ korral, nt $(x+1)^2=x^2+2x+1$. Võrrand kehtib ainult lahendite korral.`,
        r`Lineaarvõrrand $ax+b=0$, $a\ne0$: $\;x=-\dfrac ba$`,
        r`$ax^2+bx+c=0$: $\;D=b^2-4ac$, $\;x=\dfrac{-b\pm\sqrt D}{2a}$; $D>0$ — 2 lahendit, $D=0$ — 1, $D<0$ — pole.`,
        r`Taandatud $x^2+px+q=0$: $\;x=-\dfrac p2\pm\sqrt{\left(\dfrac p2\right)^2-q}$; Viète: $x_1+x_2=-p$, $x_1x_2=q$`,
        r`Mittetäielik: $ax^2+bx=0\Rightarrow x(ax+b)=0$; $\;ax^2+c=0\Rightarrow x^2=-\dfrac ca$`,
      ],
      ru_hint: [
        'Тождество верно при всех x, уравнение — только при некоторых.',
        'Дискриминант D = b² − 4ac: если D < 0, корней нет.',
        'Теорема Виета помогает проверить корни: сумма −p, произведение q.',
      ],
      example: {
        task: r`Lahenda $3x^2-5x-2=0$.`,
        steps: [
          r`$a=3$, $b=-5$, $c=-2$: $\;D=25+24=49$.`,
          r`$x=\dfrac{5\pm7}{6}$: $\;x_1=2$, $\;x_2=-\dfrac13$.`,
          r`Kontroll: $3\cdot4-10-2=0$ ✓. Graafikul on parabooli nullkohad $A$ ja $B$.`,
        ],
        graph: { fns: 'y = 3x^2 - 5x - 2', xmin: -2, xmax: 3, ymin: -5, ymax: 6, step: 1, points: 'A(-0.33; 0)\nB(2; 0)' },
      },
      practice: [
        { title: 'Lineaarvõrrand ja samasus.', parts: [
          [r`Lahenda $5(x-2)=3x+4$.`, 1, '7', r`$5x-10=3x+4$, $2x=14$, $x=7$.`, 2],
          [r`Lahenda $\dfrac x3-\dfrac{x-1}{2}=1$.`, 2, '-3', r`Korruta $6$-ga: $2x-3(x-1)=6$, $-x+3=6$, $x=-3$.`],
          [r`Kas $(x-3)^2=x^2-6x+9$ on võrrand või samasus?`, 1, 'samasus', 'Avades sulud saame mõlemal pool sama avaldise: võrdus kehtib iga x korral.', 0],
        ] },
        { title: 'Lahenda mittetäielik ruutvõrrand.', parts: [
          [r`$x^2-49=0$`, 1, '7; -7', r`$x^2=49$, $x=\pm7$.`, 1],
          [r`$2x^2+6x=0$`, 1, '0; -3', r`$2x(x+3)=0$: $x=0$ või $x=-3$.`, 1],
          [r`$x^2+9=0$`, 1, 'puuduvad|∅|lahendid puuduvad|pole', r`$x^2=-9$ — reaalarvulisi lahendeid pole.`, 1],
        ] },
        { title: 'Lahenda ruutvõrrand.', parts: [
          [r`$x^2-7x+10=0$`, 1, '2; 5', r`Viète: summa $7$, korrutis $10$: $x_1=2$, $x_2=5$.`, 2],
          [r`$4x^2+4x+1=0$`, 1, '-0,5|-1/2', r`$(2x+1)^2=0$, $x=-\frac12$.`, 1],
          [r`$2x^2+3x-5=0$`, 2, '1; -2,5', r`$D=9+40=49$, $x=\dfrac{-3\pm7}{4}$: $x_1=1$, $x_2=-2{,}5$.`],
        ] },
        { title: r`Võrrand $x^2-8x+12=0$.`, parts: [
          ['Leia Viète\'i teoreemiga lahendite summa.', 1, '8', r`$x_1+x_2=-p=8$`, 1],
          ['Leia lahendite korrutis.', 1, '12', r`$x_1x_2=q=12$`, 1],
          ['Lahenda võrrand.', 1, '2; 6', r`$2+6=8$, $2\cdot6=12$: $x_1=2$, $x_2=6$.`, 1],
          ['Koosta taandatud ruutvõrrand, mille lahendid on 3 ja −5.', 2, 'x^2+2x-15=0|x²+2x-15=0', r`$p=-(3-5)=2$, $q=3\cdot(-5)=-15$: $x^2+2x-15=0$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Ristküliku pikkus on 3 cm suurem kui laius. Ristküliku pindala on 40 cm².', parts: [
        ['Tähista laius x ja koosta võrrand.', 2, 'x(x+3)=40|x^2+3x=40|x^2+3x-40=0', r`Pikkus $x+3$: $\;x(x+3)=40$.`, 2],
        ['Lahenda võrrand.', 3, '5; -8', r`$x^2+3x-40=0$, $D=9+160=169$, $x=\dfrac{-3\pm13}{2}$: $x_1=5$, $x_2=-8$.`, 4],
        ['Leia ristküliku laius ja pikkus.', 2, '5; 8', r`Laius ei saa olla negatiivne: laius $5$ cm, pikkus $8$ cm.`, 2],
        ['Leia diagonaali pikkus kahe kümnendkohani.', 3, '9,43|√89', r`$d=\sqrt{5^2+8^2}=\sqrt{89}\approx9{,}43$ cm`, 3],
      ] },
      self: ['Eristan samasust ja võrrandit.', 'Lahendan ruutvõrrandi diskriminandiga.', 'Kontrollin lahendeid Viète\'i teoreemiga.'],
    },
    {
      title: 'Murdvõrrandid',
      ru: 'Дробные уравнения',
      course: 'I',
      exam: 'Riigieksamil on murdvõrrand sageli tekstülesande sees (kiirus, töö, hind).',
      can: 'Õpilane leiab murdvõrrandi lubamatud väärtused, viib võrrandi ühisele nimetajale ja kontrollib lahendeid.',
      theory: [
        r`Murd $\dfrac AB=0\;\Leftrightarrow\;A=0$ ja $B\ne0$.`,
        r`Kõigepealt kirjuta lubamatud väärtused: nimetaja $\ne0$.`,
        r`Ristkorrutis: $\dfrac ab=\dfrac cd\;\Rightarrow\;ad=bc$.`,
        r`Korruta võrrandi mõlemad pooled ühise nimetajaga, lahenda ja **kontrolli**, et lahend ei ole lubamatu.`,
      ],
      ru_hint: [
        'Знаменатель не может быть нулём — выпиши запрещённые x сразу.',
        'Дробь равна нулю, когда числитель равен нулю, а знаменатель — нет.',
        'Корень, который обнуляет знаменатель, — посторонний: его вычёркиваем.',
      ],
      example: {
        task: r`Lahenda $\dfrac{x}{x-3}+\dfrac{2}{x+3}=\dfrac{18}{x^2-9}$.`,
        steps: [
          r`$x^2-9=(x-3)(x+3)$, seega $x\ne3$ ja $x\ne-3$.`,
          r`Korruta $(x-3)(x+3)$-ga: $x(x+3)+2(x-3)=18$, $\;x^2+5x-24=0$.`,
          r`$(x+8)(x-3)=0$: $x=-8$ või $x=3$. $\;x=3$ on lubamatu.`,
          r`Vastus: $x=-8$.`,
        ],
      },
      practice: [
        { title: 'Lahenda.', parts: [
          [r`$\dfrac{x-5}{x+1}=0$`, 1, '5', r`Lugeja $x-5=0$, $x=5$; nimetaja $6\ne0$.`, 1],
          [r`$\dfrac{x^2-9}{x-3}=0$`, 2, '-3', r`$x^2-9=0$: $x=\pm3$, aga $x\ne3$. Vastus $x=-3$.`],
        ] },
        { title: 'Lahenda ristkorrutise abil.', parts: [
          [r`$\dfrac4x=\dfrac{6}{x+1}$`, 2, '2', r`$x\ne0$, $x\ne-1$. $\;4(x+1)=6x$, $2x=4$, $x=2$.`],
          [r`$\dfrac{x+2}{3}=\dfrac5x$`, 2, '3; -5', r`$x(x+2)=15$, $x^2+2x-15=0$, $x=3$ või $x=-5$; mõlemad sobivad.`],
        ] },
        { title: r`Võrrand $\dfrac{1}{x-2}+\dfrac{1}{x+2}=\dfrac{4}{x^2-4}$.`, parts: [
          ['Kirjuta lubamatud väärtused.', 1, '2; -2', r`$x-2\ne0$ ja $x+2\ne0$: $x\ne\pm2$.`, 1],
          ['Lahenda võrrand.', 3, 'puuduvad|∅|lahendid puuduvad|pole', r`Korruta $x^2-4$-ga: $(x+2)+(x-2)=4$, $2x=4$, $x=2$ — lubamatu. Lahendid puuduvad.`, 4],
        ] },
        { title: 'Lahenda ja kontrolli.', parts: [
          [r`$\dfrac{x}{x-1}-\dfrac{3}{x+1}=1$`, 3, '2', r`$x\ne\pm1$. Korruta $x^2-1$-ga: $x(x+1)-3(x-1)=x^2-1$, $\;x^2-2x+3=x^2-1$, $\;x=2$.`, 5],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Paat sõidab jõel 12 km pärivoolu ja siis 12 km tagasi vastuvoolu. Kogu sõit kestab 2,5 tundi. Jõe voolukiirus on 2 km/h.', parts: [
        ['Tähista paadi kiirus seisvas vees x ja koosta võrrand.', 3, '12/(x+2)+12/(x-2)=2,5|12/(x-2)+12/(x+2)=2,5',
          r`Pärivoolu kiirus $x+2$, vastuvoolu $x-2$; aeg = teepikkus : kiirus: $\dfrac{12}{x+2}+\dfrac{12}{x-2}=2{,}5$.`, 3],
        ['Lahenda võrrand.', 4, '10; -0,4', r`Korruta $(x+2)(x-2)$-ga: $12(x-2)+12(x+2)=2{,}5(x^2-4)$, $\;24x=2{,}5x^2-10$, $\;5x^2-48x-20=0$, $D=2304+400=2704=52^2$, $x=\dfrac{48\pm52}{10}$: $10$ või $-0{,}4$.`, 6],
        ['Kui suur on paadi kiirus seisvas vees (km/h)?', 1, '10', 'Kiirus ei saa olla negatiivne: 10 km/h.', 1],
        ['Mitu tundi kestis sõit pärivoolu?', 2, '1', r`$\dfrac{12}{10+2}=1$ h`, 2],
      ] },
      self: ['Kirjutan kohe lubamatud väärtused.', 'Korrutan ühise nimetajaga.', 'Kontrollin, kas lahend sobib.'],
    },
    {
      title: 'Võrrandisüsteemid',
      ru: 'Системы уравнений',
      course: 'I',
      exam: 'Riigieksamil on süsteem tekstülesandes ja kahe joone lõikepunkti leidmisel.',
      can: 'Õpilane lahendab kahe tundmatuga lineaarse võrrandisüsteemi asendus- ja liitmisvõttega ning tõlgendab lahendit graafiliselt.',
      theory: [
        r`Asendusvõte: avalda ühest võrrandist $y$ (või $x$) ja asenda teise.`,
        r`Liitmisvõte: korruta võrrandeid nii, et ühe tundmatu kordajad oleksid vastandarvud, ja liida.`,
        r`Graafiliselt: lahend on sirgete lõikepunkt $(x;y)$.`,
        r`Paralleelsed sirged — lahendid puuduvad; ühtivad sirged — lõpmata palju lahendeid.`,
      ],
      ru_hint: [
        'Подстановка удобна, когда x или y уже выражен; сложение — когда коэффициенты легко уравнять.',
        'Ответ системы — пара чисел (x; y). Проверь её в обоих уравнениях.',
        'Параллельные прямые не пересекаются — решений нет.',
      ],
      example: {
        task: r`Lahenda süsteem $\begin{cases}2x+y=7\\x-y=2\end{cases}$`,
        steps: [
          r`Liida võrrandid: $3x=9$, $x=3$.`,
          r`Teisest: $y=x-2=1$.`,
          r`Kontroll: $2\cdot3+1=7$ ✓. Vastus $(3;1)$ — sirgete $y=7-2x$ ja $y=x-2$ lõikepunkt.`,
        ],
        graph: { fns: 'y = 7 - 2x\ny = x - 2', xmin: -1, xmax: 6, ymin: -3, ymax: 7, step: 1, points: 'P(3; 1)' },
      },
      practice: [
        { title: r`Lahenda asendusvõttega: $\begin{cases}y=2x-1\\3x+y=14\end{cases}$`, parts: [
          ['', 2, '(3;5)|3;5', r`$3x+2x-1=14$, $5x=15$, $x=3$, $y=5$.`],
        ] },
        { title: r`Lahenda liitmisvõttega: $\begin{cases}3x+2y=4\\5x-2y=12\end{cases}$`, parts: [
          ['', 2, '(2;-1)|2;-1', r`Liida: $8x=16$, $x=2$; $6+2y=4$, $y=-1$.`],
        ] },
        { title: r`Lahenda: $\begin{cases}2x+3y=13\\3x-4y=-6\end{cases}$`, parts: [
          ['', 3, '(2;3)|2;3', r`Korruta esimest $4$-ga ja teist $3$-ga: $8x+12y=52$, $9x-12y=-18$. Liida: $17x=34$, $x=2$; $3y=13-4=9$, $y=3$.`, 5],
        ] },
        { title: 'Mitu lahendit on süsteemil? Kirjuta 0, 1 või lõpmata palju.', parts: [
          [r`$\begin{cases}x+y=3\\2x+2y=8\end{cases}$`, 1, '0', r`Teine võrrand: $x+y=4$. Ei saa olla korraga $3$ ja $4$ — sirged on paralleelsed.`, 1],
          [r`$\begin{cases}x-y=1\\3x-3y=3\end{cases}$`, 1, 'lõpmata palju|∞', r`Teine võrrand on esimene korda $3$ — sirged ühtivad.`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: '3 täiskasvanu ja 2 õpilase kinopiletid maksid kokku 39 €. 2 täiskasvanu ja 5 õpilase piletid maksid 48 €.', parts: [
        ['Tähista pileti hinnad ja koosta võrrandisüsteem.', 3, '', r`$t$ — täiskasvanu, $s$ — õpilase pilet: $\begin{cases}3t+2s=39\\2t+5s=48\end{cases}$`, 3],
        ['Leia täiskasvanu pileti hind.', 3, '9', r`Korruta: $6t+4s=78$ ja $6t+15s=144$. Lahuta: $11s=66$, $s=6$; $3t=39-12=27$, $t=9$ €.`, 5],
        ['Leia õpilase pileti hind.', 1, '6', r`$s=6$ €`, 1],
        ['Klass läheb kinno: 24 õpilast ja 2 õpetajat (täiskasvanu pilet). Grupp saab 15% soodustust. Kui palju maksavad piletid kokku?', 3, '137,7',
          r`$24\cdot6+2\cdot9=162$ €; $\;162\cdot0{,}85=137{,}70$ €`, 3],
      ] },
      self: ['Lahendan süsteemi liitmisvõttega.', 'Lahendan süsteemi asendusvõttega.', 'Kontrollin paari mõlemas võrrandis.'],
    },
    {
      title: 'Lineaar- ja ruutvõrratused',
      ru: 'Линейные и квадратные неравенства',
      course: 'I',
      exam: 'Riigieksami I osas on ruutvõrratus; vastus kirjutatakse vahemikuna.',
      can: 'Õpilane lahendab lineaarvõrratuse, lineaarvõrratuste süsteemi ja ruutvõrratuse parabooli abil.',
      theory: [
        r`Negatiivse arvuga korrutamisel või jagamisel pöördub võrratuse märk.`,
        r`Süsteem: lahenda iga võrratus eraldi; vastus on lahendihulkade **ühisosa**.`,
        r`Ruutvõrratus $ax^2+bx+c>0$: leia nullkohad, skitseeri parabool ($a>0$ — harud üles), vali vahemik.`,
        r`$D<0$ ja $a>0$: $ax^2+bx+c>0$ iga $x$ korral.`,
      ],
      ru_hint: [
        'Делишь на отрицательное число — переворачивай знак неравенства.',
        'Квадратное неравенство решаем по рисунку параболы: где она выше или ниже оси x.',
        'Знак ≤ или ≥ — концы входят (квадратные скобки).',
      ],
      example: {
        task: r`Lahenda $x^2-2x-3\ge0$.`,
        steps: [
          r`Nullkohad: $x^2-2x-3=0$, $x_1=-1$, $x_2=3$.`,
          r`$a=1>0$: parabool on x-teljest kõrgemal väljaspool nullkohti.`,
          r`Vastus: $x\le-1$ või $x\ge3$, s.t $(-\infty;-1]\cup[3;\infty)$.`,
        ],
        graph: { fns: 'y = x^2 - 2x - 3', xmin: -3, xmax: 5, ymin: -5, ymax: 6, step: 1, points: 'A(-1; 0)\nB(3; 0)' },
      },
      practice: [
        { title: 'Lahenda lineaarvõrratus.', parts: [
          [r`$2x-5<3x+1$`, 1, 'x>-6|(-6;∞)', r`$-x<6$; jagades $-1$-ga pöördub märk: $x>-6$.`, 2],
          [r`$\dfrac{x-1}{2}\ge\dfrac{x+2}{3}$`, 2, 'x>=7|x≥7|[7;∞)', r`Korruta $6$-ga: $3x-3\ge2x+4$, $x\ge7$.`],
        ] },
        { title: r`Võrratuste süsteem $\begin{cases}2x-1>3\\x+4\le10\end{cases}$`, parts: [
          ['Lahenda süsteem.', 2, '2<x<=6|2<x≤6|(2;6]', r`$x>2$ ja $x\le6$: $2<x\le6$.`],
          ['Kirjuta süsteemi täisarvulised lahendid.', 1, '3; 4; 5; 6', r`$3, 4, 5, 6$`, 1],
        ] },
        { title: 'Lahenda ruutvõrratus.', parts: [
          [r`$x^2-9<0$`, 1, '-3<x<3|(-3;3)', r`Nullkohad $\pm3$, harud üles: $-3<x<3$.`, 2],
          [r`$x^2+5x\ge0$`, 2, 'x<=-5 või x>=0|x≤-5 või x≥0|(-∞;-5]∪[0;∞)', r`$x(x+5)\ge0$, nullkohad $-5$ ja $0$: $x\le-5$ või $x\ge0$.`],
          [r`$-x^2+x+6>0$`, 2, '-2<x<3|(-2;3)', r`Korruta $-1$-ga: $x^2-x-6<0$, nullkohad $-2$ ja $3$: $-2<x<3$.`],
        ] },
        { title: 'Lahenda.', parts: [
          [r`$x^2+2x+5>0$`, 2, 'R|x∈R|(-∞;∞)|kõik x', r`$D=4-20<0$, $a>0$: parabool on alati x-teljest kõrgemal — iga $x$ sobib.`],
          [r`$x^2-6x+9\le0$`, 2, '3', r`$(x-3)^2\le0$ ainult siis, kui $x=3$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Üles visatud palli kõrgus (meetrites) $t$ sekundi pärast on $h(t)=-5t^2+20t+1$.`, parts: [
        ['Koosta võrratus: millal on pall kõrgemal kui 16 m?', 2, '-5t^2+20t+1>16|-5t²+20t+1>16', r`$-5t^2+20t+1>16$`, 2],
        ['Lahenda võrratus.', 4, '1<t<3|(1;3)', r`$-5t^2+20t-15>0$, jaga $-5$-ga: $t^2-4t+3<0$, nullkohad $1$ ja $3$: $1<t<3$.`, 5],
        ['Mitu sekundit on pall kõrgemal kui 16 m?', 2, '2', r`$3-1=2$ s`, 1],
        ['Mitme sekundi pärast kukub pall maha? Vastus kahe kümnendkohani.', 2, '4,05', r`$-5t^2+20t+1=0$: $t=\dfrac{20+\sqrt{420}}{10}\approx4{,}05$ s (negatiivne lahend ei sobi).`, 3],
      ] },
      self: ['Pööran märgi negatiivse arvuga jagamisel.', 'Leian süsteemi lahendite ühisosa.', 'Lahendan ruutvõrratuse parabooli abil.'],
    },
    {
      title: 'Elulised ülesanded võrrandite abil',
      ru: 'Жизненные задачи через уравнения',
      course: 'I',
      exam: 'Riigieksami II osas on alati tekstülesanne, mille lahendus on võrrand või süsteem (10 punkti).',
      can: 'Õpilane tähistab tundmatu, koostab tekstist võrrandi, lahendab selle ja kontrollib vastuse mõttekust.',
      theory: [
        r`Samm 1: tähista tundmatu ($x$ — mis?). Samm 2: koosta võrrand. Samm 3: lahenda. Samm 4: kontrolli ja kirjuta vastus.`,
        r`Liikumine: $s=vt$; $\;t=\dfrac sv$. Pärivoolu $v+v_0$, vastuvoolu $v-v_0$.`,
        r`Töö: jõudlus $=\dfrac{1}{\text{aeg}}$; koos töötades jõudlused liituvad.`,
        r`Protsent: $p\%$ arvust $a$ on $\dfrac{p}{100}a$; käibemaksuga hind $=1{,}24\cdot$ hind.`,
      ],
      ru_hint: [
        'Обязательно напиши, что обозначает x, и единицы измерения.',
        'Отрицательная длина или скорость — не ответ: такой корень отбрасываем.',
        'Совместная работа: складываем производительности 1/t.',
      ],
      example: {
        task: 'Kaks töölist teevad töö koos 6 päevaga. Esimene teeks selle üksi 10 päevaga. Mitme päevaga teeks töö teine tööline üksi?',
        steps: [
          r`Teine teeb töö $x$ päevaga: päevas $\frac1x$ tööst. Esimene teeb päevas $\frac1{10}$, koos $\frac16$.`,
          r`$\dfrac1{10}+\dfrac1x=\dfrac16$, $\;\dfrac1x=\dfrac16-\dfrac1{10}=\dfrac{5-3}{30}=\dfrac1{15}$.`,
          r`Vastus: 15 päevaga.`,
        ],
      },
      practice: [
        { title: 'Kahe arvu summa on 54. Üks arv on teisest 12 võrra suurem. Leia need arvud.', parts: [
          ['', 2, '21; 33', r`$x+(x+12)=54$, $2x=42$, $x=21$; teine $33$.`],
        ] },
        { title: 'Rong läbis 240 km. Kui kiirus oleks olnud 20 km/h suurem, kuluks sõidule 1 tund vähem.', parts: [
          ['Koosta võrrand.', 2, '240/x-240/(x+20)=1', r`$\dfrac{240}{x}-\dfrac{240}{x+20}=1$`, 2],
          ['Leia rongi kiirus.', 3, '60', r`$240(x+20)-240x=x(x+20)$, $x^2+20x-4800=0$, $D=19600$, $x=\dfrac{-20+140}{2}=60$ km/h.`, 5],
        ] },
        { title: '200 g 10-protsendilisele soolalahusele lisatakse vett, et saada 8-protsendiline lahus. Mitu grammi vett lisatakse?', parts: [
          ['', 3, '50', r`Soola on $0{,}1\cdot200=20$ g. $\;\dfrac{20}{200+x}=0{,}08$, $200+x=250$, $x=50$ g.`, 4],
        ] },
        { title: 'Telefoni hind koos 24% käibemaksuga on 372 €.', parts: [
          ['Leia hind ilma käibemaksuta.', 2, '300', r`$1{,}24x=372$, $x=300$ €`],
          ['Kui suur on käibemaks?', 1, '72', r`$372-300=72$ €`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Ristkülikukujuline aed on 30 m pikk ja 20 m lai. Aia ümber on ühtlase laiusega rada, mille pindala on 336 m².', parts: [
        ['Tähista raja laius x ja koosta võrrand.', 3, '(30+2x)(20+2x)-600=336|4x^2+100x-336=0|x^2+25x-84=0', r`Aed koos rajaga: $(30+2x)(20+2x)$; raja pindala: $(30+2x)(20+2x)-600=336$.`, 3],
        ['Lahenda võrrand.', 4, '3; -28', r`$600+100x+4x^2-600=336$, $\;x^2+25x-84=0$, $D=625+336=961=31^2$, $x=\dfrac{-25\pm31}{2}$: $3$ või $-28$.`, 5],
        ['Kui lai on rada?', 1, '3', 'Laius ei saa olla negatiivne: 3 m.', 1],
        ['Leia aia ja raja välisserva ümbermõõt.', 2, '124', r`Mõõtmed $36$ m ja $26$ m: $2(36+26)=124$ m.`, 2],
      ] },
      self: ['Kirjutan, mida x tähistab.', 'Koostan tekstist võrrandi.', 'Kontrollin, kas vastus on elus võimalik.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: I kursus',
      ru: 'Повторение и контрольная работа: I курс',
      course: 'I',
      exam: 'Kontrolltöö kordab kursuse I teemasid samas vormis nagu riigieksami I osa: iga õige samm annab punkti.',
      can: 'Õpilane lahendab I kursuse põhiülesandeid iseseisvalt ja kirjutab lahenduskäigu.',
      theory: [
        r`Vahemik ja absoluutväärtus: $|x-a|<r\Leftrightarrow a-r<x<a+r$.`,
        r`Astmed: $a^{-n}=\dfrac1{a^n}$, $\;a^{\frac mn}=\sqrt[n]{a^m}$; standardkuju $a\cdot10^n$, $1\le a<10$.`,
        r`Abivalemid: $(a\pm b)^2$, $\;a^2-b^2=(a-b)(a+b)$; $\;ax^2+bx+c=a(x-x_1)(x-x_2)$.`,
        r`Ruutvõrrand: $x=\dfrac{-b\pm\sqrt{b^2-4ac}}{2a}$; murdvõrrand: nimetaja $\ne0$; ruutvõrratus: parabool.`,
      ],
      ru_hint: [
        'Контрольная: 25 баллов, 45 минут. Пиши все шаги — балл дают за каждый верный шаг.',
        'Сначала реши задания, в которых уверен, потом возвращайся к трудным.',
        'В конце проверь корни подстановкой.',
      ],
      example: {
        task: r`Lahenda $|2x-1|\ge3$.`,
        steps: [
          r`$2x-1\ge3$ või $2x-1\le-3$.`,
          r`$x\ge2$ või $x\le-1$.`,
          r`Vastus: $(-\infty;-1]\cup[2;\infty)$.`,
        ],
      },
      practice: [
        { title: r`$A=(-2;5]$ ja $B=[3;8)$.`, parts: [
          [r`Leia $A\cap B$.`, 1, '[3;5]|3<=x<=5|3≤x≤5', r`$3\le x\le5$`, 1],
          [r`Leia $A\cup B$.`, 1, '(-2;8)|-2<x<8', r`$-2<x<8$`, 1],
        ] },
        { title: 'Arvuta.', parts: [
          [r`$\left(\dfrac19\right)^{-\frac12}\cdot2^{-2}$`, 2, '0,75|3/4', r`$9^{\frac12}\cdot\dfrac14=\dfrac34$`],
          [r`$\sqrt{75}-\sqrt{12}$`, 2, '3√3|3sqrt(3)|3*sqrt(3)', r`$5\sqrt3-2\sqrt3=3\sqrt3$`],
        ] },
        { title: 'Lahenda.', parts: [
          [r`$x^2+x-20=0$`, 2, '4; -5', r`$D=81$, $x=\dfrac{-1\pm9}{2}$: $4$ ja $-5$.`],
          [r`$\dfrac{6}{x}-\dfrac{2}{x-1}=1$`, 3, '2; 3', r`$x\ne0$, $x\ne1$. Korruta $x(x-1)$-ga: $6(x-1)-2x=x^2-x$, $\;x^2-5x+6=0$: $x=2$ või $x=3$; mõlemad sobivad.`, 5],
        ] },
        { title: 'Lahenda võrratus.', parts: [
          [r`$2x^2-8x<0$`, 2, '0<x<4|(0;4)', r`$2x(x-4)<0$: $0<x<4$.`],
          [r`$\begin{cases}3x+1\ge-5\\4-x>1\end{cases}$`, 2, '-2<=x<3|-2≤x<3|[-2;3)', r`$x\ge-2$ ja $x<3$.`],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'I kursus: arvuhulgad, avaldised, võrrandid ja võrratused. Aega 45 minutit.', parts: [
        [r`1. $A=[-3;4)$ ja $B=(1;6]$. Leia $A\cap B$.`, 2, '(1;4)|1<x<4', r`Ühine osa: $1<x<4$.`, 2],
        [r`2. Lahenda $|x-2|\le5$.`, 2, '-3<=x<=7|-3≤x≤7|[-3;7]', r`$-5\le x-2\le5$, $-3\le x\le7$.`, 2],
        [r`3. Arvuta $\left(\dfrac14\right)^{-\frac12}+\sqrt[3]{0{,}008}$.`, 2, '2,2', r`$4^{\frac12}+0{,}2=2+0{,}2=2{,}2$`, 2],
        [r`4. Lihtsusta $\dfrac{x^2-6x+9}{x^2-9}$.`, 3, '(x-3)/(x+3)', r`$\dfrac{(x-3)^2}{(x-3)(x+3)}=\dfrac{x-3}{x+3}$`, 3],
        [r`5. Lahenda $2x^2-x-6=0$.`, 3, '2; -1,5', r`$D=1+48=49$, $x=\dfrac{1\pm7}{4}$: $2$ ja $-1{,}5$.`, 3],
        [r`6. Lahenda $\dfrac{x+3}{x-1}=\dfrac{x-1}{x-3}$.`, 3, '5', r`$x\ne1;3$. $(x+3)(x-3)=(x-1)^2$, $x^2-9=x^2-2x+1$, $2x=10$, $x=5$.`, 4],
        [r`7. Lahenda süsteem $\begin{cases}x+2y=8\\3x-y=3\end{cases}$`, 3, '(2;3)|2;3', r`$x=8-2y$; $24-6y-y=3$, $y=3$, $x=2$.`, 4],
        [r`8. Lahenda $x^2-x-12<0$.`, 3, '-3<x<4|(-3;4)', r`$(x-4)(x+3)<0$: $-3<x<4$.`, 3],
        ['9. Raamat ja kaks vihikut maksavad 13 €, kaks raamatut ja vihik 20 €. Kui palju maksab raamat?', 4, '9', r`$r+2v=13$, $2r+v=20$. Teisest $v=20-2r$: $r+40-4r=13$, $r=9$ € ($v=2$ €).`, 4],
      ] },
      self: ['Oskan I kursuse kõiki ülesandetüüpe.', 'Kirjutan iga sammu.', 'Kontrollin vastused.'],
    },

    // ───────────── II kursus „Trigonomeetria” ─────────────
    {
      title: 'Teravnurga trigonomeetria',
      ru: 'Тригонометрия острого угла',
      course: 'II',
      exam: 'Täisnurkne kolmnurk on riigieksami geomeetria- ja ruumiülesannete alus (kõrgus, kalle, vari).',
      can: 'Õpilane leiab täisnurkse kolmnurga küljed ja nurgad siinuse, koosinuse ja tangensi abil.',
      theory: [
        r`$\sin\alpha=\dfrac{\text{vastaskaatet}}{\text{hüpotenuus}}$, $\;\cos\alpha=\dfrac{\text{lähiskaatet}}{\text{hüpotenuus}}$, $\;\tan\alpha=\dfrac{\text{vastaskaatet}}{\text{lähiskaatet}}$`,
        r`Pythagoras: $a^2+b^2=c^2$`,
        r`$\sin30^\circ=\frac12$, $\;\sin45^\circ=\frac{\sqrt2}{2}$, $\;\sin60^\circ=\frac{\sqrt3}{2}$; $\;\cos\alpha=\sin(90^\circ-\alpha)$; $\;\tan45^\circ=1$, $\;\tan60^\circ=\sqrt3$`,
        r`Nurk kalkulaatorist: $\alpha=\sin^{-1}(\ldots)$, $\cos^{-1}(\ldots)$, $\tan^{-1}(\ldots)$`,
      ],
      ru_hint: [
        'Противолежащий катет — напротив угла, прилежащий — рядом с углом, гипотенуза — против прямого угла.',
        'Калькулятор — в режиме градусов (DEG).',
        'Значения для 30°, 45°, 60° надо знать наизусть.',
      ],
      example: {
        task: '5 m pikkune redel toetub seinale ja moodustab maaga 70° nurga. Kui kõrgel on redeli ülemine ots? Kui kaugel seinast on alumine ots?',
        steps: [
          r`Redel on hüpotenuus, kõrgus on $70^\circ$ nurga vastaskaatet: $h=5\sin70^\circ\approx4{,}70$ m.`,
          r`Kaugus seinast on lähiskaatet: $d=5\cos70^\circ\approx1{,}71$ m.`,
          r`Kontroll: $4{,}70^2+1{,}71^2\approx25$ ✓.`,
        ],
      },
      practice: [
        { title: 'Täisnurkse kolmnurga kaatetid on 6 cm ja 8 cm.', parts: [
          ['Leia hüpotenuus.', 1, '10', r`$\sqrt{36+64}=10$ cm`, 1],
          [r`Leia 6 cm kaateti vastasnurga $\alpha$ siinus.`, 1, '0,6', r`$\sin\alpha=\frac{6}{10}=0{,}6$`, 1],
          [r`Leia $\alpha$ kahe kümnendkohani.`, 2, '36,87', r`$\alpha=\sin^{-1}0{,}6\approx36{,}87^\circ$`],
        ] },
        { title: 'Arvuta täpselt (ilma kalkulaatorita).', parts: [
          [r`$\sin30^\circ+\cos60^\circ$`, 1, '1', r`$\frac12+\frac12=1$`, 1],
          [r`$\tan60^\circ\cdot\cos30^\circ$`, 1, '1,5|3/2', r`$\sqrt3\cdot\frac{\sqrt3}{2}=\frac32$`, 1],
          [r`$\sin^2 45^\circ$`, 1, '0,5|1/2', r`$\left(\frac{\sqrt2}{2}\right)^2=\frac24=\frac12$`, 1],
        ] },
        { title: 'Täisnurkse kolmnurga hüpotenuus on 12 cm ja üks teravnurk 35°.', parts: [
          ['Leia selle nurga vastaskaatet kahe kümnendkohani.', 2, '6,88', r`$12\sin35^\circ\approx6{,}88$ cm`],
          ['Leia lähiskaatet kahe kümnendkohani.', 2, '9,83', r`$12\cos35^\circ\approx9{,}83$ cm`],
        ] },
        { title: 'Torni vari on 30 m pikk, kui päike paistab 40° nurga all. Kui kõrge on torn (kahe kümnendkohani)?', parts: [
          ['', 2, '25,17', r`$\tan40^\circ=\dfrac h{30}$, $h=30\tan40^\circ\approx25{,}17$ m`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Liiklusmärk „8% tõus” tähendab, et 100 m horisontaalse kauguse kohta tõuseb tee 8 m.', parts: [
        ['Leia tee tõusunurk kraadides kahe kümnendkohani.', 3, '4,57', r`$\tan\alpha=\dfrac{8}{100}=0{,}08$, $\alpha=\tan^{-1}0{,}08\approx4{,}57^\circ$`, 3],
        ['Tee on mööda nõlva 1,2 km pikk. Kui suur on kõrgusevahe (m, kahe kümnendkohani)?', 4, '95,69|95,7', r`$h=1200\sin\alpha\approx1200\cdot0{,}07975\approx95{,}69$ m`, 4],
        ['Kui pikk on sama tee kaardil, s.t horisontaalselt (m, ühe kümnendkohani)?', 3, '1196,2|1196,18', r`$d=1200\cos\alpha\approx1196{,}2$ m (kontroll: $\sqrt{1200^2-95{,}69^2}\approx1196{,}2$)`, 3],
      ] },
      self: ['Tean, mis on vastas- ja lähiskaatet.', 'Leian külje siinuse, koosinuse või tangensiga.', 'Leian nurga kalkulaatoriga.'],
    },
    {
      title: 'Mis tahes nurga siinus, koosinus ja tangens',
      ru: 'Синус, косинус и тангенс любого угла',
      course: 'II',
      exam: 'Riigieksamil on nürinurkse kolmnurga ülesanded ja trigonomeetrilised võrrandid lõigul [0°; 360°].',
      can: 'Õpilane määrab ühikringjoonel nurga siinuse, koosinuse ja tangensi märgi ning taandab nurga teravnurgale.',
      theory: [
        r`Ühikringjoonel on nurga $\alpha$ lõpphaara punkt $P(\cos\alpha;\,\sin\alpha)$; $\;\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}$.`,
        r`Punktist $P(x;y)$, $r=\sqrt{x^2+y^2}$: $\;\sin\alpha=\dfrac yr$, $\;\cos\alpha=\dfrac xr$, $\;\tan\alpha=\dfrac yx$.`,
        r`Märgid: I veerand kõik $+$; II — $\sin+$; III — $\tan+$; IV — $\cos+$.`,
        r`$\sin(180^\circ-\alpha)=\sin\alpha$, $\;\cos(180^\circ-\alpha)=-\cos\alpha$; $\;\sin(180^\circ+\alpha)=-\sin\alpha$, $\;\cos(180^\circ+\alpha)=-\cos\alpha$; $\;\cos(360^\circ-\alpha)=\cos\alpha$, $\;\sin(360^\circ-\alpha)=-\sin\alpha$`,
      ],
      ru_hint: [
        'На единичной окружности косинус — это x, синус — это y точки P.',
        'Знаки по четвертям: I — все +, II — синус +, III — тангенс +, IV — косинус +.',
        'Формулы приведения сводят любой угол к острому.',
      ],
      example: {
        task: r`Leia $\sin150^\circ$, $\cos150^\circ$ ja $\tan150^\circ$.`,
        steps: [
          r`$150^\circ=180^\circ-30^\circ$ on II veerandis: siinus positiivne, koosinus negatiivne.`,
          r`$\sin150^\circ=\sin30^\circ=\frac12$; $\;\cos150^\circ=-\cos30^\circ=-\frac{\sqrt3}{2}$.`,
          r`$\tan150^\circ=\dfrac{1/2}{-\sqrt3/2}=-\dfrac{\sqrt3}{3}$. Joonisel on punkt $P(\cos150^\circ;\sin150^\circ)\approx(-0{,}87;0{,}5)$.`,
        ],
        graph: { fns: 'y = sqrt(1 - x^2)\ny = -sqrt(1 - x^2)', xmin: -1.5, xmax: 1.5, ymin: -1.5, ymax: 1.5, step: 0.5, labelEvery: 2, points: 'O(0; 0)\nP(-0.87; 0.5)', segments: 'O-P', caption: 'ühikringjoon' },
      },
      practice: [
        { title: 'Veerandid ja märgid.', parts: [
          [r`Mis veerandis on $200^\circ$ nurga lõpphaar?`, 1, 'III|3', r`$180^\circ<200^\circ<270^\circ$ — III veerand.`, 0],
          [r`Kas $\cos200^\circ$ on positiivne või negatiivne?`, 1, 'negatiivne|-', 'III veerandis on koosinus negatiivne.', 0],
          [r`Mis veerandis on $300^\circ$ nurga lõpphaar?`, 1, 'IV|4', r`$270^\circ<300^\circ<360^\circ$ — IV veerand.`, 0],
        ] },
        { title: 'Leia täpne väärtus.', parts: [
          [r`$\sin120^\circ$`, 1, '√3/2|sqrt(3)/2|0,87', r`$\sin(180^\circ-60^\circ)=\sin60^\circ=\frac{\sqrt3}{2}$`, 1],
          [r`$\cos135^\circ$`, 1, '-√2/2|-sqrt(2)/2|-0,71', r`$-\cos45^\circ=-\frac{\sqrt2}{2}$`, 1],
          [r`$\tan225^\circ$`, 1, '1', r`$225^\circ=180^\circ+45^\circ$, III veerand: $\tan45^\circ=1$.`, 1],
          [r`$\cos180^\circ$`, 1, '-1', r`Punkt $(-1;0)$: $\cos180^\circ=-1$.`, 1],
        ] },
        { title: 'Taanda teravnurgale ja arvuta kahe kümnendkohani.', parts: [
          [r`$\sin160^\circ$`, 2, '0,34', r`$\sin(180^\circ-20^\circ)=\sin20^\circ\approx0{,}34$`],
          [r`$\cos250^\circ$`, 2, '-0,34', r`$\cos(180^\circ+70^\circ)=-\cos70^\circ\approx-0{,}34$`],
        ] },
        { title: r`Punkt $P(-3;4)$ asub nurga $\alpha$ lõpphaaral.`, parts: [
          [r`Leia $r=OP$.`, 1, '5', r`$\sqrt{9+16}=5$`, 1],
          [r`Leia $\sin\alpha$.`, 1, '0,8|4/5', r`$\dfrac45=0{,}8$`, 1],
          [r`Leia $\cos\alpha$.`, 1, '-0,6|-3/5', r`$\dfrac{-3}{5}=-0{,}6$`, 1],
          [r`Leia $\tan\alpha$.`, 1, '-4/3|-1,33', r`$\dfrac{4}{-3}=-\dfrac43$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`On teada, et $\cos\alpha=-0{,}8$ ja $90^\circ<\alpha<180^\circ$.`, parts: [
        [r`Leia $\sin\alpha$.`, 2, '0,6', r`$\sin^2\alpha=1-0{,}64=0{,}36$; II veerandis on siinus positiivne: $\sin\alpha=0{,}6$.`, 3],
        [r`Leia $\tan\alpha$.`, 1, '-0,75|-3/4', r`$\dfrac{0{,}6}{-0{,}8}=-0{,}75$`, 1],
        [r`Leia $\alpha$ kahe kümnendkohani.`, 2, '143,13', r`$\cos^{-1}(-0{,}8)\approx143{,}13^\circ$ (või $180^\circ-36{,}87^\circ$).`, 2],
      ] },
      self: ['Tean siinuse ja koosinuse märki igas veerandis.', 'Taandan nurga teravnurgale.', 'Leian siinuse ja koosinuse punkti koordinaatidest.'],
    },
    {
      title: 'Kraadi- ja radiaanmõõt',
      ru: 'Градусная и радианная мера',
      course: 'II',
      exam: 'Kitsa riigieksami trigonomeetria on kraadides; radiaan on vajalik kaare ja sektori valemites ning kalkulaatori režiimis.',
      can: 'Õpilane teisendab kraadid radiaanideks ja vastupidi ning kasutab täiendusnurga valemeid.',
      theory: [
        r`$180^\circ=\pi$ rad; $\;1$ rad $\approx57{,}3^\circ$`,
        r`$\alpha_{\text{rad}}=\dfrac{\pi}{180^\circ}\cdot\alpha^\circ$, $\;\alpha^\circ=\dfrac{180^\circ}{\pi}\cdot\alpha_{\text{rad}}$`,
        r`$30^\circ=\frac\pi6$, $\;45^\circ=\frac\pi4$, $\;60^\circ=\frac\pi3$, $\;90^\circ=\frac\pi2$, $\;360^\circ=2\pi$`,
        r`Täiendusnurk: $\sin(90^\circ-\alpha)=\cos\alpha$, $\;\cos(90^\circ-\alpha)=\sin\alpha$, $\;\tan(90^\circ-\alpha)=\dfrac{1}{\tan\alpha}$`,
      ],
      ru_hint: [
        'π радиан = 180°. Чтобы перевести градусы в радианы, умножаем на π/180.',
        'Режим калькулятора: DEG — градусы, RAD — радианы. Проверь его перед каждым расчётом.',
        'Синус угла равен косинусу дополнительного угла (до 90°).',
      ],
      example: {
        task: r`Teisenda $150^\circ$ radiaanideks ja $\dfrac{2\pi}{3}$ kraadideks.`,
        steps: [
          r`$150^\circ\cdot\dfrac{\pi}{180^\circ}=\dfrac{5\pi}{6}\approx2{,}62$ rad.`,
          r`$\dfrac{2\pi}{3}\cdot\dfrac{180^\circ}{\pi}=120^\circ$.`,
        ],
      },
      practice: [
        { title: 'Teisenda radiaanideks.', parts: [
          [r`$60^\circ$`, 1, 'π/3|pi/3|1,05', r`$60\cdot\frac{\pi}{180}=\frac\pi3$`, 1],
          [r`$270^\circ$`, 1, '3π/2|3pi/2|4,71', r`$270\cdot\frac{\pi}{180}=\frac{3\pi}2$`, 1],
          [r`$225^\circ$`, 1, '5π/4|5pi/4|3,93', r`$225\cdot\frac{\pi}{180}=\frac{5\pi}4$`, 1],
        ] },
        { title: 'Teisenda kraadideks.', parts: [
          [r`$\dfrac\pi6$`, 1, '30', r`$\frac{180^\circ}{6}=30^\circ$`, 1],
          [r`$\dfrac{3\pi}4$`, 1, '135', r`$3\cdot45^\circ=135^\circ$`, 1],
          [r`$2$ rad (kahe kümnendkohani)`, 2, '114,59|114,6', r`$2\cdot\frac{180^\circ}{\pi}\approx114{,}59^\circ$`],
        ] },
        { title: 'Täiendusnurga valemid.', parts: [
          [r`Leia $\sin(90^\circ-\alpha)$, kui $\cos\alpha=0{,}3$.`, 1, '0,3', r`$\sin(90^\circ-\alpha)=\cos\alpha=0{,}3$`, 1],
          [r`$\cos50^\circ=\sin x$, kus $x$ on teravnurk. Leia $x$.`, 1, '40', r`$\cos50^\circ=\sin(90^\circ-50^\circ)=\sin40^\circ$`, 1],
          [r`Lihtsusta $\sin(90^\circ-\alpha)\cdot\tan\alpha$.`, 2, 'sinα|sin(α)|sin α', r`$\cos\alpha\cdot\dfrac{\sin\alpha}{\cos\alpha}=\sin\alpha$`],
        ] },
        { title: 'Arvuta täpselt.', parts: [
          [r`$2\sin\dfrac\pi6+\cos0$`, 1, '2', r`$2\cdot\frac12+1=2$`, 1],
          [r`$\dfrac{\sin25^\circ}{\cos65^\circ}$`, 1, '1', r`$\cos65^\circ=\sin25^\circ$, seega jagatis on $1$.`, 1],
          [r`$\cos\pi$`, 1, '-1', r`$\cos180^\circ=-1$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: 'Kella minutiosuti liigub 20 minutit.', parts: [
        ['Mitu kraadi pöördub minutiosuti?', 1, '120', r`Täisring $360^\circ$ on 60 minutiga: $\frac{20}{60}\cdot360^\circ=120^\circ$.`, 1],
        ['Kirjuta see nurk radiaanides.', 2, '2π/3|2pi/3|2,09', r`$120^\circ=\dfrac{2\pi}{3}\approx2{,}09$ rad`, 2],
        ['Mitu kraadi pöördub samal ajal tunniosuti?', 2, '10', r`Tunniosuti teeb $360^\circ$ 12 tunniga, s.t $30^\circ$ tunnis ja $\frac13\cdot30^\circ=10^\circ$ 20 minutiga.`, 2],
      ] },
      self: ['Teisendan kraadid radiaanideks.', 'Tean põhinurki radiaanides.', 'Kasutan täiendusnurga valemeid.'],
    },
    {
      title: 'Trigonomeetriliste funktsioonide graafikud',
      ru: 'Графики тригонометрических функций',
      course: 'II',
      exam: 'Riigieksami II osas joonestatakse sin- või cos-graafik lõigul [0°; 360°] ja loetakse sellelt nullkohad ja lõikepunktid.',
      can: 'Õpilane loeb ja joonestab funktsioonide y = a·sin x, y = a·cos x ja y = sin x + c graafikuid ning leiab neilt väärtusi.',
      theory: [
        r`$y=\sin x$: periood $360^\circ$, väärtused $[-1;1]$, nullkohad $0^\circ,180^\circ,360^\circ$, max $90^\circ$, min $270^\circ$.`,
        r`$y=\cos x$: periood $360^\circ$, max $0^\circ$ ja $360^\circ$, nullkohad $90^\circ$, $270^\circ$, min $180^\circ$.`,
        r`$y=a\sin x$: väärtused $[-|a|;|a|]$; $\;y=\sin x+c$: graafik nihkub $c$ võrra üles.`,
        r`$y=\tan x$: periood $180^\circ$, ei ole määratud kohtadel $90^\circ$ ja $270^\circ$.`,
      ],
      ru_hint: [
        'Синус начинается с нуля, косинус — с единицы.',
        'Множитель a растягивает график по вертикали, слагаемое c сдвигает его вверх или вниз.',
        'Для графика отметь 5 точек: 0°, 90°, 180°, 270°, 360°.',
      ],
      example: {
        task: r`Võrdle funktsioone $y=\sin x$ ja $y=2\sin x$ lõigul $[0^\circ;360^\circ]$.`,
        steps: [
          r`$y=2\sin x$ väärtused on kaks korda suuremad: max $2$ kohal $90^\circ$, min $-2$ kohal $270^\circ$.`,
          r`Nullkohad ei muutu: $0^\circ$, $180^\circ$, $360^\circ$.`,
          r`Muutumispiirkond: $y=\sin x$ — $[-1;1]$, $\;y=2\sin x$ — $[-2;2]$.`,
        ],
        graph: { fns: 'y = sin(x)\ny = 2sin(x)', angle: 'deg', xmin: 0, xmax: 360, ymin: -2.5, ymax: 2.5, step: 30, stepY: 0.5, labelEvery: 3, caption: 'tumesinine: y = sin x · roheline: y = 2 sin x' },
      },
      practice: [
        { title: r`Funktsioon $y=\cos x$ lõigul $[0^\circ;360^\circ]$.`, parts: [
          ['Leia suurim väärtus.', 1, '1', r`$\cos0^\circ=\cos360^\circ=1$`, 1],
          ['Leia nullkohad.', 1, '90; 270', r`$\cos x=0$: $90^\circ$ ja $270^\circ$.`, 1],
          ['Kirjuta kahanemisvahemik.', 1, '0<x<180|(0;180)', r`$0^\circ<x<180^\circ$`, 1],
        ] },
        { title: r`Funktsioon $y=3\sin x$.`, parts: [
          ['Kirjuta muutumispiirkond.', 1, '[-3;3]|-3<=y<=3|-3≤y≤3', r`$-1\le\sin x\le1$, seega $-3\le y\le3$.`, 1],
          [r`Arvuta $y(30^\circ)$.`, 1, '1,5', r`$3\cdot\frac12=1{,}5$`, 1],
          [r`Millise $x$ korral ($0^\circ\le x\le360^\circ$) on $y=3$?`, 1, '90', r`$\sin x=1$: $x=90^\circ$.`, 1],
        ] },
        { title: r`Funktsioon $y=\sin x+1$.`, parts: [
          ['Leia suurim väärtus.', 1, '2', r`$1+1=2$`, 1],
          ['Leia vähim väärtus.', 1, '0', r`$-1+1=0$`, 1],
          ['Kus lõikab graafik y-telge?', 1, '(0;1)|1', r`$x=0$: $y=\sin0+1=1$.`, 1],
        ] },
        { title: r`Graafikud $y=\cos x$ ja $y=0{,}5$ lõigul $[0^\circ;360^\circ]$.`, parts: [
          ['Leia lõikepunktide abstsissid.', 2, '60; 300', r`$\cos x=0{,}5$: $x=60^\circ$ või $x=360^\circ-60^\circ=300^\circ$.`],
          [r`Millistel $x$ väärtustel on $\cos x>0{,}5$?`, 2, '0<=x<60 või 300<x<=360|0≤x<60 või 300<x≤360|[0;60)∪(300;360]', r`Koosinusgraafik on sirgest $y=0{,}5$ kõrgemal lõigu otstes: $0^\circ\le x<60^\circ$ või $300^\circ<x\le360^\circ$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on funktsioonid $f(x)=2\cos x$ ja $g(x)=1$ lõigul $[0^\circ;360^\circ]$.`, grid: { angle: 'deg', xmin: 0, xmax: 360, ymin: -2.5, ymax: 2.5, step: 30, stepY: 0.5, labelEvery: 3, blank: true }, parts: [
        ['Joonesta mõlema funktsiooni graafik ühes teljestikus.', 3, '', r`$f$: $2$ ($0^\circ$) → $0$ ($90^\circ$) → $-2$ ($180^\circ$) → $0$ ($270^\circ$) → $2$ ($360^\circ$); $g$ on horisontaalne sirge $y=1$.`, 0],
        [r`Kirjuta funktsiooni $f$ muutumispiirkond.`, 1, '[-2;2]|-2<=y<=2|-2≤y≤2', r`$-2\le2\cos x\le2$`, 1],
        ['Leia graafikute lõikepunktide abstsissid.', 3, '60; 300', r`$2\cos x=1$, $\cos x=0{,}5$: $x=60^\circ$ või $x=300^\circ$.`, 3],
        [r`Leia vahemik, kus $f(x)<g(x)$.`, 2, '60<x<300|(60;300)', r`Lõikepunktide vahel on $f$ graafik sirgest allpool: $60^\circ<x<300^\circ$.`, 2],
        [r`Arvuta $f(135^\circ)$ kahe kümnendkohani.`, 1, '-1,41|-√2', r`$2\cos135^\circ=-\sqrt2\approx-1{,}41$`, 1],
      ] },
      self: ['Joonestan sin- ja cos-graafiku 5 punkti järgi.', 'Loen graafikult nullkohad ja lõikepunktid.', 'Tean, mida teevad a ja c.'],
    },
    {
      title: 'Avaldiste teisendamine valemikogu abil',
      ru: 'Преобразование выражений по справочнику',
      course: 'II',
      exam: 'Riigieksami valemilehel on trigonomeetria põhiseosed; ülesandes leitakse ühest funktsioonist teised.',
      can: 'Õpilane kasutab trigonomeetria põhiseoseid ja kahekordse nurga valemeid avaldiste lihtsustamiseks ja väärtuste leidmiseks.',
      theory: [
        r`$\sin^2\alpha+\cos^2\alpha=1$, $\;\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}$, $\;1+\tan^2\alpha=\dfrac{1}{\cos^2\alpha}$ — valemilehel.`,
        r`$\sin2\alpha=2\sin\alpha\cos\alpha$, $\;\cos2\alpha=\cos^2\alpha-\sin^2\alpha$ — valemilehel.`,
        r`Ruutjuure märk sõltub veerandist: $\sin\alpha=\pm\sqrt{1-\cos^2\alpha}$.`,
      ],
      ru_hint: [
        'Основное тождество sin² + cos² = 1 даёт sin из cos и наоборот; знак выбираем по четверти.',
        'Эти формулы есть на листе формул — научись их быстро находить.',
        'Упрощая, заменяй tan на sin/cos и ищи sin² + cos².',
      ],
      example: {
        task: r`Lihtsusta $\dfrac{1-\cos^2\alpha}{\sin\alpha\cos\alpha}$.`,
        steps: [
          r`$1-\cos^2\alpha=\sin^2\alpha$.`,
          r`$\dfrac{\sin^2\alpha}{\sin\alpha\cos\alpha}=\dfrac{\sin\alpha}{\cos\alpha}=\tan\alpha$.`,
        ],
      },
      practice: [
        { title: 'Lihtsusta.', parts: [
          [r`$\sin^2\alpha+\cos^2\alpha+\tan\alpha\cos\alpha$`, 2, '1+sinα|sinα+1|1+sin(α)', r`$1+\dfrac{\sin\alpha}{\cos\alpha}\cdot\cos\alpha=1+\sin\alpha$`],
          [r`$(1-\sin\alpha)(1+\sin\alpha)$`, 1, 'cos^2α|cos²α|cos^2(α)', r`$1-\sin^2\alpha=\cos^2\alpha$`, 1],
          [r`$\dfrac{\sin2\alpha}{2\cos\alpha}$`, 1, 'sinα|sin(α)', r`$\dfrac{2\sin\alpha\cos\alpha}{2\cos\alpha}=\sin\alpha$`, 1],
        ] },
        { title: r`$\sin\alpha=\dfrac{5}{13}$ ja $\alpha$ on teravnurk.`, parts: [
          [r`Leia $\cos\alpha$.`, 2, '12/13|0,92', r`$\cos\alpha=\sqrt{1-\frac{25}{169}}=\frac{12}{13}$`],
          [r`Leia $\tan\alpha$.`, 1, '5/12|0,42', r`$\frac{5}{13}:\frac{12}{13}=\frac5{12}$`, 1],
          [r`Leia $\sin2\alpha$.`, 2, '120/169|0,71', r`$2\cdot\frac5{13}\cdot\frac{12}{13}=\frac{120}{169}$`],
        ] },
        { title: r`$\tan\alpha=2$ ja $\alpha$ on teravnurk.`, parts: [
          [r`Leia $\cos\alpha$.`, 2, '1/√5|√5/5|0,45', r`$\dfrac1{\cos^2\alpha}=1+4=5$, $\cos\alpha=\dfrac{1}{\sqrt5}\approx0{,}45$`],
          [r`Leia $\sin\alpha$.`, 1, '2/√5|2√5/5|0,89', r`$\sin\alpha=\tan\alpha\cos\alpha=\dfrac{2}{\sqrt5}\approx0{,}89$`, 1],
        ] },
        { title: r`Samasus $(\sin\alpha+\cos\alpha)^2=1+\sin2\alpha$.`, parts: [
          ['Tõesta samasus.', 2, '', r`$\sin^2\alpha+2\sin\alpha\cos\alpha+\cos^2\alpha=1+\sin2\alpha$.`, 4],
          [r`Kontrolli: arvuta vasak pool, kui $\alpha=30^\circ$ (kahe kümnendkohani).`, 1, '1,87', r`$\left(\frac12+\frac{\sqrt3}2\right)^2\approx1{,}87$; parem pool $1+\sin60^\circ\approx1{,}87$ ✓.`, 2],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`On teada, et $\cos\alpha=0{,}6$ ja $270^\circ<\alpha<360^\circ$.`, parts: [
        [r`Leia $\sin\alpha$.`, 2, '-0,8', r`$\sin^2\alpha=1-0{,}36=0{,}64$; IV veerandis on siinus negatiivne: $-0{,}8$.`, 3],
        [r`Leia $\tan\alpha$.`, 1, '-4/3|-1,33', r`$\dfrac{-0{,}8}{0{,}6}=-\dfrac43$`, 1],
        [r`Leia $\cos2\alpha$.`, 2, '-0,28', r`$0{,}36-0{,}64=-0{,}28$`, 2],
      ] },
      self: ['Leian siinusest koosinuse ja vastupidi.', 'Valin märgi veerandi järgi.', 'Kasutan valemilehte.'],
    },
    {
      title: 'Siinusteoreem',
      ru: 'Теорема синусов',
      course: 'II',
      exam: 'Riigieksamil lahendatakse kolmnurka rakendusülesandes (maamõõtmine, kaugus kaldast).',
      can: 'Õpilane leiab siinusteoreemiga kolmnurga külje ja nurga ning ümberringjoone raadiuse.',
      theory: [
        r`$\dfrac{a}{\sin\alpha}=\dfrac{b}{\sin\beta}=\dfrac{c}{\sin\gamma}=2R$ ($R$ — ümberringjoone raadius)`,
        r`Kasuta, kui on teada **külg ja kaks nurka** või **kaks külge ja ühe vastasnurk**.`,
        r`$\alpha+\beta+\gamma=180^\circ$; suurema külje vastas on suurem nurk.`,
      ],
      ru_hint: [
        'Сторона и противолежащий угол образуют пару; теорема синусов связывает такие пары.',
        'Теоремы синусов нет на листе формул — выучи её.',
        'Если знаешь два угла, третий = 180° минус их сумма.',
      ],
      example: {
        task: r`Kolmnurgas $a=7$, $\alpha=45^\circ$, $\beta=60^\circ$. Leia $b$, $\gamma$ ja $c$.`,
        steps: [
          r`$b=\dfrac{a\sin\beta}{\sin\alpha}=\dfrac{7\sin60^\circ}{\sin45^\circ}\approx8{,}57$`,
          r`$\gamma=180^\circ-45^\circ-60^\circ=75^\circ$`,
          r`$c=\dfrac{7\sin75^\circ}{\sin45^\circ}\approx9{,}56$`,
        ],
      },
      practice: [
        { title: r`Kolmnurgas $\alpha=30^\circ$, $\beta=105^\circ$ ja $a=6$.`, parts: [
          [r`Leia $\gamma$.`, 1, '45', r`$180^\circ-30^\circ-105^\circ=45^\circ$`, 1],
          [r`Leia $b$ kahe kümnendkohani.`, 2, '11,59', r`$b=\dfrac{6\sin105^\circ}{\sin30^\circ}=12\sin105^\circ\approx11{,}59$`],
          [r`Leia $c$ kahe kümnendkohani.`, 2, '8,49|6√2', r`$c=12\sin45^\circ=6\sqrt2\approx8{,}49$`],
        ] },
        { title: r`Kolmnurgas $a=10$ ja $\alpha=30^\circ$. Leia ümberringjoone raadius.`, parts: [
          ['', 2, '10', r`$2R=\dfrac{10}{\sin30^\circ}=20$, $R=10$`],
        ] },
        { title: r`Kolmnurgas $a=8$, $b=10$ ja $\beta=50^\circ$.`, parts: [
          [r`Leia $\alpha$ kahe kümnendkohani.`, 2, '37,79|37,8', r`$\sin\alpha=\dfrac{8\sin50^\circ}{10}\approx0{,}6128$, $\alpha\approx37{,}79^\circ$ ($a<b$, seega $\alpha$ on teravnurk).`, 3],
          [r`Leia $\gamma$.`, 1, '92,21|92,2', r`$180^\circ-50^\circ-37{,}79^\circ=92{,}21^\circ$`, 1],
        ] },
        { title: 'Jõe kaldal on punktid A ja B, AB = 200 m. Vastaskaldal on puu C: ∠A = 62° ja ∠B = 48°.', parts: [
          [r`Leia $\angle C$.`, 1, '70', r`$180^\circ-62^\circ-48^\circ=70^\circ$`, 1],
          ['Leia kaugus AC kahe kümnendkohani.', 2, '158,17|158,2', r`$AC=\dfrac{200\sin48^\circ}{\sin70^\circ}\approx158{,}17$ m`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Kaldal on vaatluspunktid A ja B, mille kaugus on 500 m. Paat P paistab punktist A nurga ∠PAB = 71° all ja punktist B nurga ∠PBA = 54° all.', parts: [
        [r`Leia $\angle APB$.`, 1, '55', r`$180^\circ-71^\circ-54^\circ=55^\circ$`, 1],
        ['Leia kaugus AP kahe kümnendkohani.', 3, '493,81|493,8', r`$AP=\dfrac{500\sin54^\circ}{\sin55^\circ}\approx493{,}81$ m`, 3],
        ['Leia kaugus BP kahe kümnendkohani.', 3, '577,13|577,1', r`$BP=\dfrac{500\sin71^\circ}{\sin55^\circ}\approx577{,}13$ m`, 3],
        ['Kui kaugel on paat kaldajoonest AB (m, kahe kümnendkohani)?', 3, '466,91|466,9', r`Kaugus on kolmnurga kõrgus: $h=AP\sin71^\circ\approx493{,}81\cdot0{,}9455\approx466{,}91$ m.`, 3],
      ] },
      self: ['Tean siinusteoreemi peast.', 'Leian kolmanda nurga.', 'Leian külje kahe nurga ja külje järgi.'],
    },
    {
      title: 'Koosinusteoreem ja kolmnurga lahendamine',
      ru: 'Теорема косинусов и решение треугольников',
      course: 'II',
      exam: 'Riigieksami 10-punktilises ülesandes on sageli kolmnurk, kus tuleb valida siinus- või koosinusteoreem.',
      can: 'Õpilane leiab koosinusteoreemiga külje või nurga ning valib ülesandesse sobiva teoreemi.',
      theory: [
        r`$c^2=a^2+b^2-2ab\cos\gamma$`,
        r`$\cos\gamma=\dfrac{a^2+b^2-c^2}{2ab}$; kui $\cos\gamma<0$, on $\gamma$ nürinurk.`,
        r`Kaks külge ja nendevaheline nurk **või** kolm külge → koosinusteoreem; külg ja kaks nurka → siinusteoreem.`,
        r`Rööpküliku diagonaal: $d^2=a^2+b^2-2ab\cos\alpha$.`,
      ],
      ru_hint: [
        'Две стороны и угол между ними или три стороны — теорема косинусов.',
        'Если косинус угла отрицательный, угол тупой.',
        'Теоремы косинусов нет на листе формул — выучи её.',
      ],
      example: {
        task: 'Kolmnurga küljed on 4, 5 ja 7. Leia suurim nurk.',
        steps: [
          r`Suurim nurk on suurima külje ($7$) vastas.`,
          r`$\cos\gamma=\dfrac{16+25-49}{2\cdot4\cdot5}=\dfrac{-8}{40}=-0{,}2$`,
          r`$\gamma=\cos^{-1}(-0{,}2)\approx101{,}54^\circ$ — nürinurk.`,
        ],
      },
      practice: [
        { title: r`Kolmnurgas $a=7$, $b=9$ ja $\gamma=40^\circ$. Leia $c$ kahe kümnendkohani.`, parts: [
          ['', 2, '5,79', r`$c^2=49+81-126\cos40^\circ\approx33{,}48$, $c\approx5{,}79$`],
        ] },
        { title: 'Leia kolmnurga suurim nurk.', parts: [
          ['Küljed 6, 8 ja 10.', 1, '90', r`$\cos\gamma=\dfrac{36+64-100}{96}=0$, $\gamma=90^\circ$.`, 2],
          ['Küljed 3, 5 ja 7.', 2, '120', r`$\cos\gamma=\dfrac{9+25-49}{30}=-0{,}5$, $\gamma=120^\circ$.`],
        ] },
        { title: r`Kolmnurgas $a=12$, $b=15$ ja $\gamma=110^\circ$.`, parts: [
          [r`Leia $c$ kahe kümnendkohani.`, 2, '22,18', r`$c^2=144+225-360\cos110^\circ\approx492{,}13$, $c\approx22{,}18$`],
          [r`Leia $\alpha$ kahe kümnendkohani.`, 2, '30,55|30,6', r`Siinusteoreem: $\sin\alpha=\dfrac{12\sin110^\circ}{22{,}18}\approx0{,}5083$, $\alpha\approx30{,}55^\circ$.`, 3],
        ] },
        { title: 'Rööpküliku küljed on 5 cm ja 8 cm ning nendevaheline nurk 60°.', parts: [
          ['Leia lühem diagonaal.', 2, '7', r`$d^2=25+64-80\cos60^\circ=49$, $d=7$ cm`],
          ['Leia pikem diagonaal kahe kümnendkohani.', 2, '11,36|√129', r`Teine nurk $120^\circ$: $d^2=89+40=129$, $d\approx11{,}36$ cm`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Kaks laeva väljuvad sadamast samal ajal. Üks sõidab kiirusega 18 km/h, teine 24 km/h. Nende kursside vaheline nurk on 75°.', parts: [
        ['Mitu kilomeetrit läbib kumbki laev 2 tunniga?', 2, '36; 48', r`$18\cdot2=36$ km ja $24\cdot2=48$ km`, 1],
        ['Kui kaugel on laevad teineteisest 2 tunni pärast (kahe kümnendkohani)?', 4, '52,01|52', r`$d^2=36^2+48^2-2\cdot36\cdot48\cos75^\circ\approx3600-894{,}5=2705{,}5$, $d\approx52{,}01$ km`, 5],
        ['Mitme tunni pärast on laevade vahe 78 km?', 4, '3', r`Kaugus kasvab ühtlaselt: tunniga $\sqrt{18^2+24^2-2\cdot18\cdot24\cos75^\circ}\approx26{,}0$ km. $\;78:26{,}0\approx3$ h.`, 4],
      ] },
      self: ['Valin siinus- või koosinusteoreemi.', 'Leian nurga kolme külje järgi.', 'Tunnen ära nürinurga.'],
    },
    {
      title: 'Pindalad, kaar ja sektor',
      ru: 'Площади, дуга и сектор',
      course: 'II',
      exam: 'Riigieksamil on pindala peaaegu igas geomeetriaülesandes; kaar ja sektor tulevad ka ruumiliste kehade juures.',
      can: 'Õpilane arvutab kolmnurga, rööpküliku ja korrapärase hulknurga pindala ning ringjoone kaare pikkuse ja sektori pindala.',
      theory: [
        r`Kolmnurk: $S=\dfrac12ab\sin\gamma$; $\;$ Heron: $S=\sqrt{p(p-a)(p-b)(p-c)}$, $\;p=\dfrac{a+b+c}{2}$`,
        r`Rööpkülik: $S=ab\sin\alpha$; korrapärane $n$-nurk: $n$ võrdhaarset kolmnurka.`,
        r`Kaar: $l=\dfrac{\pi r\alpha}{180^\circ}=r\alpha_{\text{rad}}$; $\;$ sektor: $S=\dfrac{\pi r^2\alpha}{360^\circ}=\dfrac12r^2\alpha_{\text{rad}}$`,
      ],
      ru_hint: [
        'Площадь треугольника: половина произведения двух сторон на синус угла между ними.',
        'Дуга и сектор — это часть окружности и круга: α/360 от целого.',
        'Правильный шестиугольник состоит из 6 равносторонних треугольников.',
      ],
      example: {
        task: r`Ringi raadius on 6 cm, sektori kesknurk $120^\circ$. Leia kaare pikkus ja sektori pindala.`,
        steps: [
          r`$l=\dfrac{\pi\cdot6\cdot120^\circ}{180^\circ}=4\pi\approx12{,}57$ cm`,
          r`$S=\dfrac{\pi\cdot36\cdot120^\circ}{360^\circ}=12\pi\approx37{,}70$ cm²`,
        ],
      },
      practice: [
        { title: 'Leia kolmnurga pindala.', parts: [
          [r`$a=9$, $b=12$, $\gamma=30^\circ$`, 1, '27', r`$\frac12\cdot9\cdot12\cdot\frac12=27$`, 1],
          ['Küljed 5, 6 ja 7 (kahe kümnendkohani).', 2, '14,7|6√6', r`$p=9$, $S=\sqrt{9\cdot4\cdot3\cdot2}=\sqrt{216}\approx14{,}70$`],
        ] },
        { title: 'Rööpküliku küljed on 6 cm ja 10 cm, üks nurk on 150°. Leia pindala.', parts: [
          ['', 2, '30', r`$S=6\cdot10\cdot\sin150^\circ=60\cdot\frac12=30$ cm²`],
        ] },
        { title: 'Korrapärase kuusnurga külg on 4 cm. Leia pindala kahe kümnendkohani.', parts: [
          ['', 3, '41,57|24√3', r`Kuus võrdkülgset kolmnurka: $6\cdot\frac12\cdot4\cdot4\cdot\sin60^\circ=24\sqrt3\approx41{,}57$ cm²`, 4],
        ] },
        { title: 'Ringi raadius on 10 cm, sektori kesknurk 72°.', parts: [
          ['Leia kaare pikkus kahe kümnendkohani.', 1, '12,57|4π', r`$\dfrac{\pi\cdot10\cdot72}{180}=4\pi\approx12{,}57$ cm`, 1],
          ['Leia sektori pindala kahe kümnendkohani.', 2, '62,83|20π', r`$\dfrac{\pi\cdot100\cdot72}{360}=20\pi\approx62{,}83$ cm²`],
          ['Kirjuta kesknurk radiaanides.', 1, '2π/5|0,4π|1,26', r`$72\cdot\frac{\pi}{180}=\frac{2\pi}5$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: 'Ringikujulise lillepeenra raadius on 4 m. Peenra sektor kesknurgaga 135° (keskpunkt O, kaare otspunktid A ja B) istutatakse roose täis.', parts: [
        ['Leia sektori kaare pikkus kahe kümnendkohani.', 2, '9,42|3π', r`$l=\dfrac{\pi\cdot4\cdot135}{180}=3\pi\approx9{,}42$ m`, 2],
        ['Leia roosiala pindala kahe kümnendkohani.', 3, '18,85|6π', r`$S=\dfrac{\pi\cdot16\cdot135}{360}=6\pi\approx18{,}85$ m²`, 3],
        ['Roosiala piiratakse äärisega (kaar ja kaks raadiust). Kui pikk on ääris?', 2, '17,42', r`$2\cdot4+9{,}42=17{,}42$ m`, 2],
        ['Leia kolmnurga OAB pindala kahe kümnendkohani.', 3, '5,66|4√2', r`$\frac12\cdot4\cdot4\cdot\sin135^\circ=4\sqrt2\approx5{,}66$ m²`, 3],
      ] },
      self: ['Arvutan kolmnurga pindala siinusega.', 'Leian kaare pikkuse.', 'Leian sektori pindala.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: II kursus',
      ru: 'Повторение и контрольная работа: II курс',
      course: 'II',
      exam: 'Kontrolltöö kordab trigonomeetriat samas vormis nagu riigieksam: kolmnurk, nurgad, kaar ja sektor.',
      can: 'Õpilane lahendab II kursuse põhiülesandeid iseseisvalt ja kirjutab lahenduskäigu.',
      theory: [
        r`Täisnurkne kolmnurk: $\sin$, $\cos$, $\tan$; mis tahes nurk: $P(\cos\alpha;\sin\alpha)$, märgid veerandites.`,
        r`$180^\circ=\pi$; $\;\sin^2\alpha+\cos^2\alpha=1$; $\;\sin x=a$: $x_2=180^\circ-x_1$; $\;\cos x=a$: $x_2=360^\circ-x_1$.`,
        r`$\dfrac{a}{\sin\alpha}=\dfrac{b}{\sin\beta}$; $\;c^2=a^2+b^2-2ab\cos\gamma$; $\;S=\dfrac12ab\sin\gamma$.`,
        r`$l=\dfrac{\pi r\alpha}{180^\circ}$, $\;S_{\text{sektor}}=\dfrac{\pi r^2\alpha}{360^\circ}$.`,
      ],
      ru_hint: [
        'Контрольная: 25 баллов, 45 минут. Калькулятор в режиме DEG.',
        'Каждый раз пиши формулу, потом подставляй числа.',
        'Ответы округляй до двух знаков после запятой.',
      ],
      example: {
        task: r`Lahenda $\sin x=-0{,}5$ lõigul $[0^\circ;360^\circ]$.`,
        steps: [
          r`Teravnurk: $\sin30^\circ=0{,}5$. Siinus on negatiivne III ja IV veerandis.`,
          r`$x_1=180^\circ+30^\circ=210^\circ$, $\;x_2=360^\circ-30^\circ=330^\circ$.`,
        ],
        graph: { fns: 'y = sin(x)\ny = -0.5', angle: 'deg', xmin: 0, xmax: 360, ymin: -1.5, ymax: 1.5, step: 30, stepY: 0.5, labelEvery: 3, points: 'A(210; -0.5)\nB(330; -0.5)' },
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$\cos120^\circ+\sin210^\circ$`, 2, '-1', r`$-\frac12+\left(-\frac12\right)=-1$`],
          [r`$315^\circ$ radiaanides`, 1, '7π/4|7pi/4|5,5', r`$315\cdot\frac{\pi}{180}=\frac{7\pi}4$`, 1],
        ] },
        { title: r`Kolmnurgas $b=6$, $c=9$ ja $\alpha=48^\circ$.`, parts: [
          [r`Leia $a$ kahe kümnendkohani.`, 2, '6,69', r`$a^2=36+81-108\cos48^\circ\approx117-72{,}27=44{,}73$, $a\approx6{,}69$`],
        ] },
        { title: r`$\sin\alpha=0{,}6$, $\alpha$ on nürinurk.`, parts: [
          [r`Leia $\cos\alpha$.`, 1, '-0,8', r`II veerand: $-\sqrt{1-0{,}36}=-0{,}8$`, 1],
          [r`Leia $\alpha$ kahe kümnendkohani.`, 1, '143,13', r`$180^\circ-36{,}87^\circ=143{,}13^\circ$`, 1],
        ] },
        { title: 'Ringi raadius on 3 cm, kaare pikkus 5 cm.', parts: [
          ['Leia kesknurk kraadides kahe kümnendkohani.', 2, '95,49|95,5', r`$\alpha=\dfrac{180^\circ l}{\pi r}=\dfrac{900^\circ}{3\pi}\approx95{,}49^\circ$`],
          ['Leia sektori pindala.', 1, '7,5', r`$S=\frac12 rl=\frac12\cdot3\cdot5=7{,}5$ cm²`, 1],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'II kursus: trigonomeetria. Aega 45 minutit, kalkulaator kraadides.', parts: [
        ['1. Täisnurkse kolmnurga hüpotenuus on 15 cm ja üks teravnurk 28°. Leia selle nurga vastaskaatet kahe kümnendkohani.', 2, '7,04', r`$15\sin28^\circ\approx7{,}04$ cm`, 2],
        [r`2. Arvuta täpselt $\sin150^\circ+\cos300^\circ$.`, 2, '1', r`$\sin30^\circ+\cos60^\circ=\frac12+\frac12=1$`, 2],
        [r`3. Kirjuta $210^\circ$ radiaanides.`, 2, '7π/6|7pi/6|3,67', r`$210\cdot\frac{\pi}{180}=\frac{7\pi}{6}$`, 1],
        [r`4. $\sin\alpha=0{,}28$ ja $90^\circ<\alpha<180^\circ$. Leia $\cos\alpha$.`, 2, '-0,96', r`$-\sqrt{1-0{,}0784}=-0{,}96$`, 2],
        [r`5. Leia sama nurga $\tan\alpha$ kahe kümnendkohani.`, 1, '-0,29|-7/24', r`$\dfrac{0{,}28}{-0{,}96}\approx-0{,}29$`, 1],
        [r`6. Lahenda $\cos x=-0{,}5$ lõigul $[0^\circ;360^\circ]$.`, 3, '120; 240', r`$x_1=180^\circ-60^\circ=120^\circ$, $x_2=360^\circ-120^\circ=240^\circ$.`, 3],
        [r`7. Kolmnurgas $a=10$, $b=14$ ja $\gamma=65^\circ$. Leia $c$ kahe kümnendkohani.`, 3, '13,33', r`$c^2=100+196-280\cos65^\circ\approx177{,}67$, $c\approx13{,}33$`, 3],
        ['8. Leia sama kolmnurga pindala kahe kümnendkohani.', 2, '63,44', r`$\frac12\cdot10\cdot14\cdot\sin65^\circ\approx63{,}44$`, 2],
        [r`9. Kolmnurgas $a=9$, $\alpha=40^\circ$, $\beta=75^\circ$. Leia $b$ kahe kümnendkohani.`, 3, '13,52', r`$b=\dfrac{9\sin75^\circ}{\sin40^\circ}\approx13{,}52$`, 3],
        ['10. Ringi raadius on 5 cm, sektori kesknurk 144°. Leia kaare pikkus kahe kümnendkohani.', 2, '12,57|4π', r`$\dfrac{\pi\cdot5\cdot144}{180}=4\pi\approx12{,}57$ cm`, 2],
        ['11. Leia selle sektori pindala kahe kümnendkohani.', 3, '31,42|10π', r`$\dfrac{\pi\cdot25\cdot144}{360}=10\pi\approx31{,}42$ cm²`, 2],
      ] },
      self: ['Oskan II kursuse kõiki ülesandetüüpe.', 'Kasutan kalkulaatorit kraadides.', 'Kirjutan valemi enne arvutamist.'],
    },

    // ───────────── III kursus „Vektor tasandil. Joone võrrand” ─────────────
    {
      title: 'Vektor, kahe punkti kaugus ja lõigu keskpunkt',
      ru: 'Вектор, расстояние между точками и середина отрезка',
      course: 'III',
      exam: 'Riigieksami koordinaatgeomeetria ülesanne algab peaaegu alati külje pikkusest või keskpunktist.',
      can: 'Õpilane leiab vektori koordinaadid ja pikkuse, kahe punkti kauguse ja lõigu keskpunkti.',
      theory: [
        r`$A(x_1;y_1)$, $B(x_2;y_2)$: $\;\overrightarrow{AB}=(x_2-x_1;\;y_2-y_1)$`,
        r`$|\overrightarrow{AB}|=AB=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$`,
        r`Lõigu keskpunkt $M\left(\dfrac{x_1+x_2}{2};\dfrac{y_1+y_2}{2}\right)$`,
        r`Võrdsetel vektoritel on võrdsed koordinaadid; rööpkülikus $ABCD$: $\overrightarrow{AB}=\overrightarrow{DC}$.`,
      ],
      ru_hint: [
        'Координаты вектора: конец минус начало.',
        'Длина вектора — по теореме Пифагора.',
        'Середина отрезка — среднее арифметическое координат концов.',
      ],
      example: {
        task: r`$A(-1;2)$ ja $B(3;5)$. Leia $\overrightarrow{AB}$, $AB$ ja lõigu $AB$ keskpunkt.`,
        steps: [
          r`$\overrightarrow{AB}=(3-(-1);\;5-2)=(4;3)$`,
          r`$AB=\sqrt{16+9}=5$`,
          r`$M\left(\frac{-1+3}{2};\frac{2+5}{2}\right)=(1;3{,}5)$`,
        ],
        graph: { fns: '', xmin: -2, xmax: 4, ymin: 0, ymax: 6, step: 1, points: 'A(-1; 2)\nB(3; 5)\nM(1; 3.5)', segments: 'A-B' },
      },
      practice: [
        { title: r`$A(2;-1)$ ja $B(-4;7)$.`, parts: [
          [r`Leia $\overrightarrow{AB}$.`, 1, '(-6;8)', r`$(-4-2;\;7+1)=(-6;8)$`, 1],
          [r`Leia $AB$.`, 1, '10', r`$\sqrt{36+64}=10$`, 1],
          ['Leia lõigu AB keskpunkt.', 1, '(-1;3)', r`$\left(\frac{2-4}{2};\frac{-1+7}{2}\right)=(-1;3)$`, 1],
        ] },
        { title: r`$M(3;4)$ on lõigu $AB$ keskpunkt ja $A(1;-2)$. Leia punkt $B$.`, parts: [
          ['', 2, '(5;10)', r`$x_B=2\cdot3-1=5$, $y_B=2\cdot4-(-2)=10$`],
        ] },
        { title: r`Kolmnurga tipud on $A(0;0)$, $B(4;0)$ ja $C(1;3)$.`, parts: [
          [r`Leia $BC$ kahe kümnendkohani.`, 1, '4,24|3√2', r`$\sqrt{9+9}=3\sqrt2\approx4{,}24$`, 1],
          [r`Leia $AC$ kahe kümnendkohani.`, 1, '3,16|√10', r`$\sqrt{1+9}=\sqrt{10}\approx3{,}16$`, 1],
          ['Leia kolmnurga ümbermõõt kahe kümnendkohani.', 1, '11,41', r`$4+4{,}243+3{,}162\approx11{,}41$`, 1],
        ] },
        { title: r`$A(1;y)$, $B(4;5)$ ja $AB=5$. Leia $y$.`, parts: [
          ['', 3, '1; 9', r`$9+(5-y)^2=25$, $(5-y)^2=16$, $5-y=\pm4$: $y=1$ või $y=9$.`, 4],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: r`Rööpküliku $ABCD$ tipud on $A(-2;1)$, $B(3;2)$ ja $C(5;6)$.`, grid: { xmin: -3, xmax: 6, ymin: 0, ymax: 7, step: 1, blank: true }, parts: [
        ['Leia diagonaali AC keskpunkt.', 2, '(1,5;3,5)', r`$\left(\frac{-2+5}{2};\frac{1+6}{2}\right)=(1{,}5;3{,}5)$`, 2],
        ['Leia tipp D.', 2, '(0;5)', r`Diagonaalid poolitavad teineteist: $D=2M-B=(3-3;\;7-2)=(0;5)$. (Või $\overrightarrow{AD}=\overrightarrow{BC}=(2;4)$.)`, 3],
        ['Leia külje AB pikkus kahe kümnendkohani.', 1, '5,1|√26', r`$\sqrt{25+1}=\sqrt{26}\approx5{,}10$`, 1],
      ] },
      self: ['Leian vektori koordinaadid.', 'Arvutan kahe punkti kauguse.', 'Leian lõigu keskpunkti ja otspunkti.'],
    },
    {
      title: 'Tehted vektoritega',
      ru: 'Действия с векторами',
      course: 'III',
      exam: 'Vektorite liitmine ja arvuga korrutamine on rakendusülesannetes (liikumine, jõud) ja kujundi tipu leidmisel.',
      can: 'Õpilane liidab ja lahutab vektoreid ning korrutab vektori arvuga koordinaatides ja joonisel.',
      theory: [
        r`$\vec a=(a_1;a_2)$, $\vec b=(b_1;b_2)$: $\;\vec a\pm\vec b=(a_1\pm b_1;\;a_2\pm b_2)$, $\;k\vec a=(ka_1;\;ka_2)$`,
        r`Kolmnurga reegel: $\overrightarrow{AB}+\overrightarrow{BC}=\overrightarrow{AC}$; rööpküliku reegel.`,
        r`$|\vec a|=\sqrt{a_1^2+a_2^2}$; $\;\vec a=a_1\vec i+a_2\vec j$, kus $\vec i=(1;0)$, $\vec j=(0;1)$.`,
      ],
      ru_hint: [
        'Складываем и вычитаем векторы покоординатно.',
        'Правило треугольника: конец первого вектора — начало второго.',
        'Умножение на число растягивает вектор; отрицательное число меняет направление.',
      ],
      example: {
        task: r`$\vec a=(2;-1)$ ja $\vec b=(1;3)$. Leia $2\vec a+\vec b$ ja selle pikkus.`,
        steps: [
          r`$2\vec a=(4;-2)$; $\;2\vec a+\vec b=(4+1;\;-2+3)=(5;1)$.`,
          r`$|2\vec a+\vec b|=\sqrt{25+1}=\sqrt{26}\approx5{,}10$.`,
        ],
        graph: { fns: '', xmin: -1, xmax: 6, ymin: -3, ymax: 3, step: 1, points: 'O(0; 0)\nA(4; -2)\nC(5; 1)', segments: 'O-A\nA-C\nO-C', caption: 'OA = 2a, AC = b, OC = 2a + b' },
      },
      practice: [
        { title: r`$\vec a=(3;-2)$ ja $\vec b=(-1;4)$.`, parts: [
          [r`$\vec a+\vec b$`, 1, '(2;2)', r`$(3-1;\;-2+4)=(2;2)$`, 1],
          [r`$\vec a-\vec b$`, 1, '(4;-6)', r`$(3+1;\;-2-4)=(4;-6)$`, 1],
          [r`$3\vec a-2\vec b$`, 2, '(11;-14)', r`$(9;-6)-(-2;8)=(11;-14)$`],
        ] },
        { title: 'Pikkus ja arv.', parts: [
          [r`Leia $|\vec a|$, kui $\vec a=(3;-2)$ (kahe kümnendkohani).`, 1, '3,61|√13', r`$\sqrt{9+4}=\sqrt{13}\approx3{,}61$`, 1],
          [r`Leia $k$, kui $k\cdot(2;-3)=(-6;9)$.`, 1, '-3', r`$2k=-6$ ja $-3k=9$: $k=-3$.`, 1],
        ] },
        { title: 'Ühikvektorid.', parts: [
          [r`Kirjuta $\vec c=2\vec i-5\vec j$ koordinaadid.`, 1, '(2;-5)', r`$\vec c=(2;-5)$`, 1],
          [r`Leia $|4\vec i+3\vec j|$.`, 1, '5', r`$\sqrt{16+9}=5$`, 1],
        ] },
        { title: r`$A(1;1)$, $B(4;3)$ ja $C(6;7)$.`, parts: [
          [r`Leia $\overrightarrow{AB}+\overrightarrow{BC}$.`, 1, '(5;6)', r`$=\overrightarrow{AC}=(5;6)$`, 1],
          [r`Leia punkt $D$, nii et $\overrightarrow{AD}=2\overrightarrow{AB}$.`, 2, '(7;5)', r`$\overrightarrow{AB}=(3;2)$, $2\overrightarrow{AB}=(6;4)$, $D=(1+6;\;1+4)=(7;5)$`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Paat liigub vee suhtes kiirusega $\vec v=(6;8)$ km/h, jõe vool on $\vec u=(2;-3)$ km/h. Paat alustab punktist $O(0;0)$.`, parts: [
        ['Leia paadi kiirusvektor kalda suhtes.', 2, '(8;5)', r`$\vec v+\vec u=(6+2;\;8-3)=(8;5)$`, 2],
        ['Leia paadi kiirus kalda suhtes kahe kümnendkohani.', 3, '9,43|√89', r`$\sqrt{64+25}=\sqrt{89}\approx9{,}43$ km/h`, 3],
        ['Kui pika tee läbib paat 2 tunniga (km, kahe kümnendkohani)?', 2, '18,87|2√89', r`$2\cdot9{,}434\approx18{,}87$ km`, 2],
        ['Leia paadi asukoht 2 tunni pärast.', 3, '(16;10)', r`$2\cdot(8;5)=(16;10)$`, 2],
      ] },
      self: ['Liidan ja lahutan vektoreid.', 'Korrutan vektori arvuga.', 'Kasutan kolmnurga reeglit.'],
    },
    {
      title: 'Skalaarkorrutis, ristseis ja kollineaarsus',
      ru: 'Скалярное произведение, перпендикулярность и коллинеарность',
      course: 'III',
      exam: 'Riigieksamil näidatakse skalaarkorrutisega, et kolmnurk on täisnurkne, või leitakse nurk.',
      can: 'Õpilane arvutab skalaarkorrutise, leiab vektorite vahelise nurga ning kontrollib ristseisu ja kollineaarsust.',
      theory: [
        r`$\vec a\cdot\vec b=a_1b_1+a_2b_2=|\vec a|\,|\vec b|\cos\varphi$`,
        r`$\cos\varphi=\dfrac{a_1b_1+a_2b_2}{|\vec a|\,|\vec b|}$`,
        r`Ristseis: $\vec a\perp\vec b\;\Leftrightarrow\;\vec a\cdot\vec b=0$`,
        r`Kollineaarsus: $\vec a\parallel\vec b\;\Leftrightarrow\;\dfrac{a_1}{b_1}=\dfrac{a_2}{b_2}$ (vektorid on teineteise kordsed).`,
      ],
      ru_hint: [
        'Скалярное произведение — число, а не вектор.',
        'Нулевое скалярное произведение — векторы перпендикулярны.',
        'Коллинеарные векторы пропорциональны: координаты отличаются в одно и то же число раз.',
      ],
      example: {
        task: r`Leia vektorite $\vec a=(1;2)$ ja $\vec b=(3;1)$ vaheline nurk.`,
        steps: [
          r`$\vec a\cdot\vec b=3+2=5$; $\;|\vec a|=\sqrt5$, $|\vec b|=\sqrt{10}$.`,
          r`$\cos\varphi=\dfrac{5}{\sqrt{50}}=\dfrac{\sqrt2}{2}$, $\;\varphi=45^\circ$.`,
        ],
        graph: { fns: '', xmin: -1, xmax: 4, ymin: -1, ymax: 3, step: 1, points: 'O(0; 0)\nA(1; 2)\nB(3; 1)', segments: 'O-A\nO-B' },
      },
      practice: [
        { title: r`$\vec a=(2;5)$ ja $\vec b=(-3;4)$.`, parts: [
          [r`Arvuta $\vec a\cdot\vec b$.`, 1, '14', r`$-6+20=14$`, 1],
          ['Leia vektorite vaheline nurk kahe kümnendkohani.', 2, '58,67|58,7', r`$\cos\varphi=\dfrac{14}{\sqrt{29}\cdot5}\approx0{,}5199$, $\varphi\approx58{,}67^\circ$`, 3],
        ] },
        { title: r`Leia $x$, kui $(x;3)\perp(4;-2)$.`, parts: [
          ['', 2, '1,5|3/2', r`$4x-6=0$, $x=1{,}5$`],
        ] },
        { title: 'Kollineaarsus.', parts: [
          [r`Leia $y$, kui $(4;y)\parallel(2;-3)$.`, 2, '-6', r`$\dfrac42=\dfrac{y}{-3}$, $y=-6$`],
          [r`Kas $(2;-6)$ ja $(-1;3)$ on kollineaarsed? Kirjuta jah või ei.`, 1, 'jah', r`$(2;-6)=-2\cdot(-1;3)$ — jah.`, 0],
        ] },
        { title: r`Kolmnurga tipud on $A(1;1)$, $B(5;2)$ ja $C(2;5)$. Leia $\angle A$ kahe kümnendkohani.`, parts: [
          ['', 3, '61,93|61,9', r`$\overrightarrow{AB}=(4;1)$, $\overrightarrow{AC}=(1;4)$; $\cos A=\dfrac{8}{\sqrt{17}\sqrt{17}}=\dfrac8{17}$, $A\approx61{,}93^\circ$`, 4],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Kolmnurga tipud on $A(-2;-1)$, $B(4;1)$ ja $C(3;4)$.`, grid: { xmin: -3, xmax: 5, ymin: -2, ymax: 5, step: 1, blank: true }, parts: [
        [r`Arvuta $\overrightarrow{AB}\cdot\overrightarrow{AC}$.`, 2, '40', r`$\overrightarrow{AB}=(6;2)$, $\overrightarrow{AC}=(5;5)$: $30+10=40$`, 2],
        [r`Leia $\angle A$ kahe kümnendkohani.`, 3, '26,57|26,6', r`$\cos A=\dfrac{40}{\sqrt{40}\sqrt{50}}\approx0{,}8944$, $A\approx26{,}57^\circ$`, 3],
        [r`Arvuta $\overrightarrow{BA}\cdot\overrightarrow{BC}$ ja tee järeldus nurga $B$ kohta.`, 3, '0', r`$\overrightarrow{BA}=(-6;-2)$, $\overrightarrow{BC}=(-1;3)$: $6-6=0$, seega $\angle B=90^\circ$.`, 3],
        ['Leia kolmnurga pindala.', 2, '10', r`$S=\frac12\cdot BA\cdot BC=\frac12\sqrt{40}\cdot\sqrt{10}=\frac12\cdot20=10$`, 2],
      ] },
      self: ['Arvutan skalaarkorrutise.', 'Leian vektorite vahelise nurga.', 'Kontrollin ristseisu ja kollineaarsust.'],
    },
    {
      title: 'Sirge tõusunurk ja võrrand',
      ru: 'Угол наклона и уравнение прямой',
      course: 'III',
      exam: 'Riigieksamil koostatakse sirge võrrand kahe punkti järgi ja kasutatakse lineaarset mudelit (hind, kulu).',
      can: 'Õpilane leiab sirge tõusu ja tõusunurga ning koostab sirge võrrandi punkti ja tõusu või kahe punkti järgi.',
      theory: [
        r`$y=kx+b$: $\;k=\tan\alpha$ (tõus), $b$ — lõikepunkt y-teljega.`,
        r`$k=\dfrac{y_2-y_1}{x_2-x_1}$; $\;$ punkt ja tõus: $y-y_1=k(x-x_1)$`,
        r`Sihivektor $\vec s=(s_1;s_2)$: $\;k=\dfrac{s_2}{s_1}$. Üldkuju $Ax+By+C=0$: $\;k=-\dfrac AB$.`,
        r`$x=a$ — y-teljega paralleelne sirge; $y=b$ — x-teljega paralleelne sirge.`,
      ],
      ru_hint: [
        'Угловой коэффициент k — это тангенс угла наклона прямой к оси x.',
        'Если k < 0, прямая убывает и угол наклона тупой.',
        'Чтобы найти b, подставь координаты точки в y = kx + b.',
      ],
      example: {
        task: r`Sirge läbib punkti $A(-1;-2)$ ja tema tõusunurk on $45^\circ$. Koosta võrrand.`,
        steps: [
          r`$k=\tan45^\circ=1$.`,
          r`$y-(-2)=1\cdot(x-(-1))$, $\;y+2=x+1$.`,
          r`$y=x-1$.`,
        ],
        graph: { fns: 'y = x - 1', xmin: -3, xmax: 4, ymin: -4, ymax: 3, step: 1, points: 'A(-1; -2)' },
      },
      practice: [
        { title: 'Leia sirge tõusunurk (kahe kümnendkohani, kui vaja).', parts: [
          [r`$y=\sqrt3x+2$`, 1, '60', r`$\tan\alpha=\sqrt3$, $\alpha=60^\circ$`, 1],
          [r`$y=-x+4$`, 1, '135', r`$\tan\alpha=-1$, $\alpha=180^\circ-45^\circ=135^\circ$`, 1],
          [r`$y=0{,}5x-1$`, 1, '26,57|26,6', r`$\alpha=\tan^{-1}0{,}5\approx26{,}57^\circ$`, 1],
        ] },
        { title: r`Koosta punkte $A(2;-1)$ ja $B(6;7)$ läbiva sirge võrrand.`, parts: [
          ['', 2, 'y=2x-5', r`$k=\dfrac{7+1}{6-2}=2$; $-1=2\cdot2+b$, $b=-5$: $y=2x-5$`],
        ] },
        { title: 'Koosta sirge võrrand.', parts: [
          [r`Läbib punkti $P(3;2)$, tõus $k=-2$.`, 1, 'y=-2x+8', r`$y-2=-2(x-3)$, $y=-2x+8$`, 1],
          [r`Läbib punkti $(0;1)$, sihivektor $\vec s=(2;3)$.`, 2, 'y=1,5x+1|y=3x/2+1|y=(3/2)x+1', r`$k=\frac32$, $b=1$: $y=1{,}5x+1$`],
        ] },
        { title: r`Sirge $3x-2y+6=0$.`, parts: [
          ['Leia tõus.', 1, '1,5|3/2', r`$2y=3x+6$, $y=1{,}5x+3$: $k=1{,}5$`, 1],
          ['Leia y-telje lõikepunkti ordinaat.', 1, '3', r`$b=3$`, 1],
          ['Leia x-telje lõikepunkti abstsiss.', 1, '-2', r`$y=0$: $3x+6=0$, $x=-2$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (5 punkti)', context: 'Takso hind sõltub sõidu pikkusest lineaarselt: 3 km sõit maksab 6,40 € ja 8 km sõit 12,40 €.', parts: [
        ['Koosta hinna valem y = kx + b (x — kilomeetrid, y — hind eurodes).', 3, 'y=1,2x+2,8', r`$k=\dfrac{12{,}40-6{,}40}{8-3}=1{,}2$; $6{,}40=1{,}2\cdot3+b$, $b=2{,}8$: $y=1{,}2x+2{,}8$`, 4],
        ['Kui palju maksab 15 km sõit?', 1, '20,8', r`$1{,}2\cdot15+2{,}8=20{,}80$ €`, 1],
        ['Mitu kilomeetrit saab sõita 26,80 euro eest?', 1, '20', r`$1{,}2x+2{,}8=26{,}8$, $x=20$ km`, 1],
      ] },
      self: ['Leian tõusu kahe punkti järgi.', 'Leian tõusunurga.', 'Koostan sirge võrrandi.'],
    },
    {
      title: 'Sirgete vastastikune asend ja nurk',
      ru: 'Взаимное расположение прямых и угол между ними',
      course: 'III',
      exam: 'Riigieksamil leitakse kolmnurga kõrgus kui ristsirge või kontrollitakse rööpkülikut paralleelsusega.',
      can: 'Õpilane määrab, kas sirged on paralleelsed, ristuvad või lõikuvad, koostab paralleelse ja ristuva sirge võrrandi ning leiab sirgete vahelise nurga.',
      theory: [
        r`$y=k_1x+b_1$ ja $y=k_2x+b_2$: paralleelsed $k_1=k_2$, $b_1\ne b_2$; ühtivad $k_1=k_2$, $b_1=b_2$.`,
        r`Ristuvad: $k_1\cdot k_2=-1$.`,
        r`Nurk sirgete vahel: $\tan\varphi=\left|\dfrac{k_2-k_1}{1+k_1k_2}\right|$.`,
      ],
      ru_hint: [
        'Параллельные прямые — одинаковый наклон k.',
        'Перпендикулярные — произведение наклонов равно −1: k₂ = −1/k₁.',
        'Угол между прямыми берём острый, поэтому в формуле модуль.',
      ],
      example: {
        task: r`Leia sirgete $y=2x+1$ ja $y=-x+4$ lõikepunkt ja nurk.`,
        steps: [
          r`$2x+1=-x+4$, $x=1$, $y=3$: lõikepunkt $P(1;3)$.`,
          r`$\tan\varphi=\left|\dfrac{-1-2}{1+2\cdot(-1)}\right|=\left|\dfrac{-3}{-1}\right|=3$.`,
          r`$\varphi=\tan^{-1}3\approx71{,}57^\circ$.`,
        ],
        graph: { fns: 'y = 2x + 1\ny = -x + 4', xmin: -2, xmax: 4, ymin: -2, ymax: 6, step: 1, points: 'P(1; 3)' },
      },
      practice: [
        { title: 'Kas sirged on paralleelsed, risti, ühtivad või lihtsalt lõikuvad?', parts: [
          [r`$y=3x-1$ ja $y=3x+5$`, 1, 'paralleelsed', r`$k_1=k_2=3$, $b_1\ne b_2$.`, 0],
          [r`$y=2x+1$ ja $y=-0{,}5x+3$`, 1, 'risti|ristuvad', r`$2\cdot(-0{,}5)=-1$.`, 0],
          [r`$y=x+2$ ja $2y=2x+4$`, 1, 'ühtivad', r`Teine on $y=x+2$ — sama sirge.`, 0],
        ] },
        { title: r`Läbi punkti $P(1;4)$.`, parts: [
          [r`Koosta sirgega $y=3x-2$ paralleelse sirge võrrand.`, 2, 'y=3x+1', r`$k=3$: $4=3+b$, $b=1$: $y=3x+1$`],
          [r`Koosta sirgega $y=3x-2$ risti oleva sirge võrrand.`, 2, 'y=-x/3+13/3|y=-1/3x+13/3|y=(-1/3)x+13/3', r`$k=-\frac13$: $4=-\frac13+b$, $b=\frac{13}3$`],
        ] },
        { title: r`Leia sirgete $y=x$ ja $y=3x$ vaheline nurk kahe kümnendkohani.`, parts: [
          ['', 2, '26,57|26,6', r`$\tan\varphi=\left|\dfrac{3-1}{1+3}\right|=0{,}5$, $\varphi\approx26{,}57^\circ$`],
        ] },
        { title: r`Sirged $y=ax+1$ ja $y=4x-3$.`, parts: [
          [r`Leia $a$, kui sirged on risti.`, 1, '-0,25|-1/4', r`$4a=-1$, $a=-\frac14$`, 1],
          [r`Leia $a$, kui sirged on paralleelsed.`, 1, '4', r`$a=4$ (ja $1\ne-3$).`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Kolmnurga tipud on $A(0;6)$, $B(4;-2)$ ja $C(-3;0)$.`, grid: { xmin: -4, xmax: 5, ymin: -3, ymax: 7, step: 1, blank: true }, parts: [
        ['Koosta sirge AB võrrand.', 3, 'y=-2x+6', r`$k=\dfrac{-2-6}{4-0}=-2$, $b=6$: $y=-2x+6$`, 3],
        ['Koosta tipust C tõmmatud kõrguse sirge võrrand.', 3, 'y=0,5x+1,5|y=x/2+3/2', r`Risti $AB$-ga: $k=\frac12$; $0=\frac12\cdot(-3)+b$, $b=1{,}5$: $y=0{,}5x+1{,}5$`, 3],
        ['Leia kõrguse aluspunkt (sirgete lõikepunkt).', 2, '(1,8;2,4)', r`$-2x+6=0{,}5x+1{,}5$, $2{,}5x=4{,}5$, $x=1{,}8$, $y=2{,}4$`, 3],
        ['Leia kõrguse pikkus kahe kümnendkohani.', 2, '5,37', r`$\sqrt{(1{,}8+3)^2+2{,}4^2}=\sqrt{28{,}8}\approx5{,}37$`, 2],
      ] },
      self: ['Tunnen tõusu järgi ära paralleelsed ja ristuvad sirged.', 'Koostan risti oleva sirge võrrandi.', 'Leian sirgete vahelise nurga.'],
    },
    {
      title: 'Ringjoone võrrand ja parabool',
      ru: 'Уравнение окружности и парабола',
      course: 'III',
      exam: 'Riigieksamil on parabool funktsiooni ja integraali ülesannetes; ringjoon koordinaatgeomeetrias.',
      can: 'Õpilane koostab ringjoone võrrandi, leiab võrrandist keskpunkti ja raadiuse ning leiab parabooli haripunkti ja nullkohad.',
      theory: [
        r`Ringjoon keskpunktiga $K(a;b)$ ja raadiusega $r$: $\;(x-a)^2+(y-b)^2=r^2$; $\;$ keskpunkt $O$: $x^2+y^2=r^2$.`,
        r`Täisruuduks täiendamine: $x^2-4x=(x-2)^2-4$.`,
        r`Parabool $y=ax^2+bx+c$: haripunkt $x_0=-\dfrac{b}{2a}$, $y_0=f(x_0)$; $\;a>0$ — harud üles.`,
        r`$y=a(x-x_0)^2+y_0$ — haripunkti kuju.`,
      ],
      ru_hint: [
        'В уравнении окружности стоят (x − a) и (y − b): знак координат центра противоположный.',
        'Чтобы найти центр, выделяем полные квадраты.',
        'Вершина параболы: x₀ = −b/(2a).',
      ],
      example: {
        task: r`Leia ringjoone $x^2+y^2-4x+6y-3=0$ keskpunkt ja raadius.`,
        steps: [
          r`$x^2-4x=(x-2)^2-4$, $\;y^2+6y=(y+3)^2-9$.`,
          r`$(x-2)^2-4+(y+3)^2-9-3=0$, $\;(x-2)^2+(y+3)^2=16$.`,
          r`Keskpunkt $K(2;-3)$, raadius $r=4$.`,
        ],
        graph: { fns: 'y = -3 + sqrt(16 - (x - 2)^2)\ny = -3 - sqrt(16 - (x - 2)^2)', xmin: -3, xmax: 7, ymin: -8, ymax: 2, step: 1, points: 'K(2; -3)' },
      },
      practice: [
        { title: 'Koosta ringjoone võrrand.', parts: [
          [r`Keskpunkt $K(3;-1)$, raadius $5$.`, 1, '(x-3)^2+(y+1)^2=25|(x-3)²+(y+1)²=25', r`$(x-3)^2+(y+1)^2=25$`, 1],
          [r`Keskpunkt $O(0;0)$, läbib punkti $P(3;4)$.`, 2, 'x^2+y^2=25|x²+y²=25', r`$r=\sqrt{9+16}=5$: $x^2+y^2=25$`],
        ] },
        { title: r`Ringjoon $x^2+y^2+6x-2y-15=0$.`, parts: [
          ['Leia keskpunkt.', 2, '(-3;1)', r`$(x+3)^2-9+(y-1)^2-1-15=0$, $(x+3)^2+(y-1)^2=25$: $K(-3;1)$`],
          ['Leia raadius.', 1, '5', r`$r=\sqrt{25}=5$`, 1],
        ] },
        { title: r`Ringjoon $(x-1)^2+(y+1)^2=25$.`, parts: [
          [r`Kas punkt $A(4;3)$ on ringjoonel? Kirjuta jah või ei.`, 1, 'jah', r`$9+16=25$ — jah.`, 1],
          [r`Kas punkt $B(5;0)$ on ringi sees või väljas?`, 1, 'sees|ringi sees', r`$16+1=17<25$ — sees.`, 1],
        ] },
        { title: r`Parabool $y=x^2-6x+5$.`, parts: [
          ['Leia haripunkt.', 2, '(3;-4)', r`$x_0=\frac62=3$, $y_0=9-18+5=-4$`],
          ['Leia nullkohad.', 1, '1; 5', r`$x^2-6x+5=0$: $x=1$ või $x=5$`, 1],
          ['Leia lõikepunkt y-teljega.', 1, '(0;5)|5', r`$x=0$: $y=5$`, 1],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Ringjoone diameetri otspunktid on $A(-1;2)$ ja $B(5;10)$.`, grid: { xmin: -4, xmax: 8, ymin: 0, ymax: 12, step: 1, blank: true }, parts: [
        ['Leia ringjoone keskpunkt.', 2, '(2;6)', r`Diameetri keskpunkt: $\left(\frac{-1+5}{2};\frac{2+10}{2}\right)=(2;6)$`, 2],
        ['Leia raadius.', 2, '5', r`$AB=\sqrt{36+64}=10$, $r=5$`, 2],
        ['Koosta ringjoone võrrand.', 2, '(x-2)^2+(y-6)^2=25|(x-2)²+(y-6)²=25', r`$(x-2)^2+(y-6)^2=25$`, 1],
        ['Leia ringjoone ja y-telje lõikepunktide ordinaadid kahe kümnendkohani.', 4, '10,58; 1,42|6+√21; 6-√21', r`$x=0$: $4+(y-6)^2=25$, $(y-6)^2=21$, $y=6\pm\sqrt{21}$: $y\approx10{,}58$ ja $y\approx1{,}42$`, 4],
      ] },
      self: ['Koostan ringjoone võrrandi.', 'Leian võrrandist keskpunkti ja raadiuse.', 'Leian parabooli haripunkti.'],
    },
    {
      title: 'Kahe joone lõikepunktid',
      ru: 'Точки пересечения двух линий',
      course: 'III',
      exam: 'Riigieksami integraali- ja funktsiooniülesanne algab sageli parabooli ja sirge lõikepunktidest.',
      can: 'Õpilane leiab sirge ja parabooli, sirge ja ringjoone ning kahe parabooli lõikepunktid võrrandisüsteemi abil.',
      theory: [
        r`Lõikepunkt rahuldab mõlema joone võrrandit: lahenda süsteem.`,
        r`Sirge ja parabool: võrdsusta $y$-d $\Rightarrow$ ruutvõrrand. $D>0$ — 2 punkti, $D=0$ — puutub, $D<0$ — ei lõiku.`,
        r`Sirge ja ringjoon: asenda $y=kx+b$ ringjoone võrrandisse.`,
        r`Leia $x$, siis $y$ **lihtsamast** võrrandist.`,
      ],
      ru_hint: [
        'Точка пересечения — решение системы из двух уравнений.',
        'Приравниваем y и получаем квадратное уравнение.',
        'Не забудь найти y для каждого x — ответ это точки (x; y).',
      ],
      example: {
        task: r`Leia parabooli $y=x^2-2x-3$ ja sirge $y=x+1$ lõikepunktid.`,
        steps: [
          r`$x^2-2x-3=x+1$, $\;x^2-3x-4=0$, $\;x=4$ või $x=-1$.`,
          r`$y=x+1$: $\;(4;5)$ ja $(-1;0)$.`,
        ],
        graph: { fns: 'y = x^2 - 2x - 3\ny = x + 1', xmin: -3, xmax: 6, ymin: -5, ymax: 8, step: 1, points: 'A(-1; 0)\nB(4; 5)' },
      },
      practice: [
        { title: r`Leia parabooli $y=x^2-4$ ja sirge $y=2x-1$ lõikepunktid.`, parts: [
          ['', 3, '(3;5); (-1;-3)', r`$x^2-2x-3=0$: $x=3$ või $x=-1$; $y=2x-1$: $(3;5)$ ja $(-1;-3)$.`, 4],
        ] },
        { title: r`Parabool $y=x^2+1$ ja sirge $y=2x$.`, parts: [
          ['Leia ühised punktid.', 2, '(1;2)', r`$x^2-2x+1=0$, $(x-1)^2=0$, $x=1$, $y=2$.`],
          ['Mitu ühist punkti on? Mida see tähendab?', 1, '1', r`$D=0$: üks punkt — sirge puutub parabooli.`, 1],
        ] },
        { title: r`Leia ringjoone $x^2+y^2=25$ ja sirge $y=x+1$ lõikepunktid.`, parts: [
          ['', 3, '(3;4); (-4;-3)', r`$x^2+(x+1)^2=25$, $2x^2+2x-24=0$, $x^2+x-12=0$: $x=3$ või $x=-4$; $(3;4)$ ja $(-4;-3)$.`, 5],
        ] },
        { title: r`Leia paraboolide $y=x^2$ ja $y=-x^2+8$ lõikepunktid.`, parts: [
          ['', 2, '(2;4); (-2;4)', r`$2x^2=8$, $x=\pm2$, $y=4$.`],
        ] },
      ],
      examTask: { title: 'Kontrollülesanne (10 punkti)', context: r`Antud on parabool $y=-x^2+4x$ ja sirge $y=x$.`, grid: { xmin: -1, xmax: 5, ymin: -1, ymax: 5, step: 1, blank: true }, parts: [
        ['Leia parabooli ja sirge lõikepunktid.', 4, '(0;0); (3;3)', r`$-x^2+4x=x$, $x^2-3x=0$, $x(x-3)=0$: $(0;0)$ ja $(3;3)$.`, 4],
        ['Leia parabooli haripunkt.', 2, '(2;4)', r`$x_0=-\frac{4}{-2}=2$, $y_0=-4+8=4$`, 2],
        ['Joonesta parabool ja sirge ühes teljestikus.', 2, '', r`Parabool läbib punkte $(0;0)$, $(2;4)$, $(4;0)$; sirge läbib $(0;0)$ ja $(3;3)$.`, 0],
        ['Leia lõikepunktide vahelise lõigu pikkus kahe kümnendkohani.', 2, '4,24|3√2', r`$\sqrt{9+9}=3\sqrt2\approx4{,}24$`, 2],
      ] },
      self: ['Koostan lõikepunktide leidmiseks süsteemi.', 'Leian iga x-i jaoks y.', 'Tean, millal sirge puutub parabooli.'],
    },
    {
      title: 'Kordamine ja kontrolltöö: III kursus',
      ru: 'Повторение и контрольная работа: III курс',
      course: 'III',
      exam: 'Kontrolltöö kordab koordinaatgeomeetriat samas vormis nagu riigieksam: vektor, sirge, ringjoon, lõikepunktid.',
      can: 'Õpilane lahendab III kursuse põhiülesandeid iseseisvalt ja kirjutab lahenduskäigu.',
      theory: [
        r`$\overrightarrow{AB}=(x_2-x_1;y_2-y_1)$, $\;AB=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$, keskpunkt $\left(\frac{x_1+x_2}2;\frac{y_1+y_2}2\right)$.`,
        r`$\vec a\cdot\vec b=a_1b_1+a_2b_2=|\vec a||\vec b|\cos\varphi$; risti $\Leftrightarrow\vec a\cdot\vec b=0$.`,
        r`$y=kx+b$, $k=\dfrac{y_2-y_1}{x_2-x_1}$; paralleelsed $k_1=k_2$, risti $k_1k_2=-1$.`,
        r`$(x-a)^2+(y-b)^2=r^2$; lõikepunktid — süsteemi lahendid.`,
      ],
      ru_hint: [
        'Контрольная: 25 баллов, 45 минут.',
        'Сделай набросок в системе координат — он помогает увидеть ошибку.',
        'Ответ с точками пиши как (x; y).',
      ],
      example: {
        task: r`Kas punktid $A(1;2)$, $B(3;6)$ ja $C(5;10)$ asuvad ühel sirgel?`,
        steps: [
          r`$\overrightarrow{AB}=(2;4)$, $\overrightarrow{AC}=(4;8)=2\overrightarrow{AB}$.`,
          r`Vektorid on kollineaarsed ja neil on ühine punkt $A$ — punktid on ühel sirgel $y=2x$.`,
        ],
      },
      practice: [
        { title: r`$A(2;-3)$ ja $B(-4;5)$.`, parts: [
          [r`Leia $AB$.`, 1, '10', r`$\sqrt{36+64}=10$`, 1],
          ['Koosta sirge AB võrrand.', 2, 'y=-4x/3-1/3|y=(-4/3)x-1/3', r`$k=\dfrac{8}{-6}=-\frac43$; $-3=-\frac83+b$, $b=-\frac13$`],
        ] },
        { title: r`$\vec a=(1;-2)$ ja $\vec b=(6;3)$.`, parts: [
          [r`Arvuta $\vec a\cdot\vec b$.`, 1, '0', r`$6-6=0$`, 1],
          [r`Leia $|\vec a+\vec b|$ kahe kümnendkohani.`, 2, '7,07|5√2', r`$\vec a+\vec b=(7;1)$, $\sqrt{50}\approx7{,}07$`],
        ] },
        { title: r`Ringjoon keskpunktiga $K(-2;3)$ läbib punkti $P(1;7)$.`, parts: [
          ['Leia raadius.', 1, '5', r`$\sqrt{9+16}=5$`, 1],
          ['Koosta võrrand.', 1, '(x+2)^2+(y-3)^2=25|(x+2)²+(y-3)²=25', r`$(x+2)^2+(y-3)^2=25$`, 1],
        ] },
        { title: r`Leia sirgete $y=3x-4$ ja $x+2y=6$ lõikepunkt.`, parts: [
          ['', 2, '(2;2)', r`$x+2(3x-4)=6$, $7x=14$, $x=2$, $y=2$`],
        ] },
      ],
      examTask: { title: 'Kontrolltöö (25 punkti)', context: 'III kursus: vektor tasandil, joone võrrand. Aega 45 minutit.', parts: [
        [r`1. $A(-3;2)$ ja $B(5;-4)$. Leia $AB$.`, 2, '10', r`$\sqrt{64+36}=10$`, 2],
        ['2. Leia lõigu AB keskpunkt.', 2, '(1;-1)', r`$\left(\frac{-3+5}2;\frac{2-4}2\right)=(1;-1)$`, 1],
        [r`3. $\vec a=(2;-3)$ ja $\vec b=(4;1)$. Leia $2\vec a-\vec b$.`, 2, '(0;-7)', r`$(4;-6)-(4;1)=(0;-7)$`, 1],
        [r`4. Arvuta $\vec a\cdot\vec b$.`, 1, '5', r`$8-3=5$`, 1],
        [r`5. Leia vektorite $\vec a$ ja $\vec b$ vaheline nurk kahe kümnendkohani.`, 3, '70,35|70,3', r`$\cos\varphi=\dfrac{5}{\sqrt{13}\sqrt{17}}\approx0{,}3363$, $\varphi\approx70{,}35^\circ$`, 3],
        [r`6. Leia $m$, kui $(m;2)\perp(3;-6)$.`, 2, '4', r`$3m-12=0$, $m=4$`, 1],
        [r`7. Koosta punkte $C(-1;5)$ ja $D(3;-3)$ läbiva sirge võrrand.`, 3, 'y=-2x+3', r`$k=\dfrac{-8}{4}=-2$; $5=2+b$, $b=3$`, 3],
        [r`8. Koosta punkti $P(2;1)$ läbiva ja sirgega $y=-2x+3$ paralleelse sirge võrrand.`, 2, 'y=-2x+5', r`$1=-4+b$, $b=5$`, 2],
        [r`9. Ringjoon $x^2+y^2-2x+4y-20=0$. Leia keskpunkt.`, 2, '(1;-2)', r`$(x-1)^2+(y+2)^2=25$`, 2],
        ['10. Leia selle ringjoone raadius.', 1, '5', r`$r=\sqrt{25}=5$`, 0],
        [r`11. Leia parabooli $y=x^2-3$ ja sirge $y=2x$ lõikepunktid.`, 5, '(3;6); (-1;-2)', r`$x^2-2x-3=0$: $x=3$ või $x=-1$; $(3;6)$ ja $(-1;-2)$.`, 4],
      ] },
      self: ['Oskan III kursuse kõiki ülesandetüüpe.', 'Teen koordinaatteljestikus visandi.', 'Kirjutan punktid kujul (x; y).'],
    },
  ],
};
