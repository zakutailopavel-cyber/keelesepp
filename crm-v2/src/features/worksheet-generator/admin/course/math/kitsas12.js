// Matemaatika kitsas riigieksam (12. klass), owner 2026-11-16: „срочно делаем курс по математике с 10 по 12 класс и
// экзамены”, exam first. One lesson per recurring exam task type (docs/MATH_RIIGIEKSAM_KITSAS.md); every task is our own
// (Harno past papers are a format reference only). Estonian with short Russian hints.
// A lesson: theory (formulas to know — the kitsas valemileht has only trigonometry and derivatives), a worked example,
// practice tasks with answers and step-by-step solutions, one task in the exam's own form and points.
// Text is Markdown + $…$ formulas (KaTeX, engine/math.jsx); r`…` keeps the backslashes of LaTeX.
// A part: [text, points, answer, solution, rows?] — answer '' means the teacher judges it (a drawing, an explanation);
// several right forms are separated by |, several answers by ; (engine/mathExpr.js sameMathAnswer).
import { KITSAS_12_MOCKS } from './kitsas12mocks.js';

const r = String.raw;

export const KITSAS_12 = {
  id: 'mk12',
  title: 'Matemaatika kitsas: riigieksamiks',
  // the library level (Õppevara → Matemaatika, libraryModel.subjectOfLevel); the sheet's level box shows the short one
  level: '12. klass matemaatika kitsas',
  sheetLevel: 'Kitsas',
  minutes: 90,
  goal: 'Õpilane lahendab kitsa matemaatika riigieksami kõiki ülesandetüüpe ja kirjutab lahenduse samm-sammult.',
  // three full mock exams after the topic lessons (mk12-015…017, kitsas12mocks.js)
  mocks: KITSAS_12_MOCKS,
  lessons: [
    {
      title: 'Avaldiste lihtsustamine',
      ru: 'Упрощение выражений',
      course: 'I',
      exam: 'I osa, 5-punktiline ülesanne: lihtsusta avaldis ja arvuta selle väärtus.',
      can: 'Õpilane lihtsustab astmeid ja murdavaldisi, kasutab korrutamise abivalemeid ja arvutab avaldise väärtuse.',
      theory: [
        r`$a^m\cdot a^n=a^{m+n}$, $\;a^m:a^n=a^{m-n}$, $\;(a^m)^n=a^{mn}$`,
        r`$a^{-n}=\dfrac{1}{a^n}$, $\;a^{\frac{m}{n}}=\sqrt[n]{a^m}$, $\;a^0=1$`,
        r`$(a\pm b)^2=a^2\pm 2ab+b^2$, $\;(a-b)(a+b)=a^2-b^2$`,
        r`$ax^2+bx+c=a(x-x_1)(x-x_2)$, kus $x_1, x_2$ on ruutvõrrandi lahendid`,
      ],
      ru_hint: [
        'Сначала разложи числитель и знаменатель на множители, потом сокращай.',
        'Сокращать можно только множители, а не слагаемые.',
        'Эти формулы на экзамене не даются — их надо знать наизусть.',
      ],
      example: {
        task: r`Lihtsusta $\dfrac{x^2-9}{x^2+3x}:\dfrac{x-3}{x}$.`,
        steps: [
          r`Tegurda: $x^2-9=(x-3)(x+3)$ ja $x^2+3x=x(x+3)$.`,
          r`Jagamine = korrutamine pöördarvuga: $\dfrac{(x-3)(x+3)}{x(x+3)}\cdot\dfrac{x}{x-3}$.`,
          r`Taanda $(x-3)$, $(x+3)$ ja $x$: vastus on $1$ (kui $x\ne 0$, $x\ne 3$, $x\ne -3$).`,
        ],
      },
      practice: [
        { title: 'Arvuta astmete reeglitega.', parts: [
          [r`$2^3\cdot 2^5:2^6$`, 1, '4', r`$2^{3+5-6}=2^2=4$`],
          [r`$(3^2)^3:3^4$`, 1, '9', r`$3^{6-4}=3^2=9$`],
          [r`$\left(\frac{1}{2}\right)^{-3}$`, 1, '8', r`$\left(\frac12\right)^{-3}=2^3=8$`],
          [r`$27^{\frac{2}{3}}$`, 1, '9', r`$\left(\sqrt[3]{27}\right)^2=3^2=9$`],
        ] },
        { title: 'Tegurda.', parts: [
          [r`$x^2-16$`, 1, '(x-4)(x+4)|(x+4)(x-4)', r`Ruutude vahe: $x^2-4^2=(x-4)(x+4)$.`],
          [r`$x^2-5x+6$`, 2, '(x-2)(x-3)|(x-3)(x-2)', r`$x^2-5x+6=0$ lahendid on $2$ ja $3$, seega $(x-2)(x-3)$.`],
        ] },
        { title: 'Lihtsusta ja arvuta.', parts: [
          [r`Lihtsusta $\dfrac{x^2-4}{x^2-2x}$.`, 2, '(x+2)/x|1+2/x', r`$\dfrac{(x-2)(x+2)}{x(x-2)}=\dfrac{x+2}{x}$`],
          [r`Arvuta selle avaldise väärtus, kui $x=4$.`, 1, '1,5', r`$\dfrac{4+2}{4}=1{,}5$`],
        ] },
        { title: 'Lihtsusta avaldis.', parts: [
          [r`$\left(\dfrac{a}{a-b}-\dfrac{b}{a+b}\right)\cdot\dfrac{a^2-b^2}{a^2+b^2}$`, 3, '1',
            r`Ühine nimetaja $a^2-b^2$: $\dfrac{a(a+b)-b(a-b)}{a^2-b^2}=\dfrac{a^2+b^2}{a^2-b^2}$. Korrutades $\dfrac{a^2-b^2}{a^2+b^2}$-ga jääb $1$.`, 6],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (5 punkti)', context: r`Antud on avaldis $\dfrac{x^2-9}{x^2-6x+9}\cdot\dfrac{x-3}{x}$.`, parts: [
        ['Lihtsusta avaldis.', 3, '(x+3)/x|1+3/x', r`$x^2-6x+9=(x-3)^2$, seega $\dfrac{(x-3)(x+3)}{(x-3)^2}\cdot\dfrac{x-3}{x}=\dfrac{x+3}{x}$.`, 6],
        [r`Arvuta avaldise väärtus, kui $x=0{,}5$.`, 2, '7', r`$\dfrac{0{,}5+3}{0{,}5}=\dfrac{3{,}5}{0{,}5}=7$`, 3],
      ] },
      self: ['Kasutan astmete reegleid.', 'Tegurdan ruutude vahe ja ruutkolmliikme.', 'Taandan ainult tegureid.'],
    },
    {
      title: 'Võrrandid ja võrratused',
      ru: 'Уравнения и неравенства',
      course: 'I',
      exam: 'I osa: ruutvõrratus, murdvõrrand, juurvõrrand (5 või 10 punkti).',
      can: 'Õpilane lahendab ruut-, murd- ja juurvõrrandi ning ruutvõrratuse ja kontrollib lahendeid.',
      theory: [
        r`$ax^2+bx+c=0$: $\;x=\dfrac{-b\pm\sqrt{D}}{2a}$, $\;D=b^2-4ac$`,
        r`Murdvõrrand: nimetaja ei tohi olla $0$ — kirjuta kohe välja, millised $x$ ei sobi.`,
        r`Ruutvõrratus: leia nullkohad, joonesta parabool, vali sobiv vahemik.`,
        r`Juurvõrrand: tõsta ruutu ja **kontrolli** iga lahendit algvõrrandis.`,
      ],
      ru_hint: [
        'Неравенство: нули параболы делят ось на интервалы; ветви вверх при a > 0.',
        'После возведения в квадрат могут появиться посторонние корни — всегда делай проверку.',
        'Ответ неравенства можно записать как −2 < x < 3 или как интервал (−2; 3).',
      ],
      example: {
        task: r`Lahenda võrratus $x^2-x-6<0$.`,
        steps: [
          r`Nullkohad: $x^2-x-6=0$, $D=1+24=25$, $x=\dfrac{1\pm 5}{2}$, seega $x_1=-2$, $x_2=3$.`,
          r`$a=1>0$, parabooli harud on üleval: parabool on x-teljest allpool nullkohtade vahel.`,
          r`Vastus: $-2<x<3$.`,
        ],
        graph: { fns: 'y = x^2 - x - 6', xmin: -4, xmax: 5, ymin: -8, ymax: 6, step: 1, stepY: 2, points: 'A(-2; 0)\nB(3; 0)' },
      },
      practice: [
        { title: 'Lahenda ruutvõrrand.', parts: [
          [r`$2x^2-3x-2=0$`, 2, '2; -0,5', r`$D=9+16=25$, $x=\dfrac{3\pm5}{4}$: $x_1=2$, $x_2=-0{,}5$.`],
          [r`$x^2+4x+4=0$`, 1, '-2', r`$(x+2)^2=0$, seega $x=-2$.`],
        ] },
        { title: 'Lahenda murdvõrrand.', parts: [
          [r`$\dfrac{x+1}{x-2}=2$`, 2, '5', r`$x\ne2$. $x+1=2x-4$, seega $x=5$.`],
          [r`$\dfrac{2}{x}+\dfrac{3}{x+2}=1$`, 3, '4; -1', r`$x\ne0$, $x\ne-2$. Korruta $x(x+2)$-ga: $2(x+2)+3x=x^2+2x$, $x^2-3x-4=0$, $x=4$ või $x=-1$ — mõlemad sobivad.`, 6],
        ] },
        { title: 'Lahenda võrratus.', parts: [
          [r`$3-2x\ge 7$`, 1, 'x<=-2|x≤-2|(-∞;-2]', r`$-2x\ge4$; jagades negatiivse arvuga pöördub märk: $x\le-2$.`],
          [r`$x^2-4x>0$`, 2, 'x<0 või x>4|(-∞;0)∪(4;∞)', r`$x(x-4)>0$, nullkohad $0$ ja $4$, harud üleval: $x<0$ või $x>4$.`],
        ] },
        { title: 'Lahenda juurvõrrand ja tee kontroll.', parts: [
          [r`$\sqrt{x+7}=x+1$`, 3, '2', r`$x+7=x^2+2x+1$, $x^2+x-6=0$, $x=2$ või $x=-3$. Kontroll: $x=2$: $\sqrt9=3=3$ ✓; $x=-3$: $\sqrt4=2\ne-2$ — võõrlahend. Vastus $x=2$.`, 6],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', parts: [
        [r`Lahenda võrratus $x^2+2x-8\le0$.`, 4, '-4<=x<=2|-4≤x≤2|[-4;2]', r`Nullkohad: $x^2+2x-8=0$, $x=-4$ või $x=2$. Harud üleval, seega $-4\le x\le2$.`, 6],
        ['Leia selle võrratuse täisarvulised lahendid ja nende summa.', 3, '-7', r`$-4,-3,-2,-1,0,1,2$; summa $=-7$.`, 4],
        [r`Lahenda võrrand $\sqrt{2x+8}=x$.`, 3, '4', r`$2x+8=x^2$, $x^2-2x-8=0$, $x=4$ või $x=-2$. Kontroll: $x=-2$ annab $\sqrt4=2\ne-2$. Vastus $x=4$.`, 6],
      ] },
      self: ['Lahendan ruutvõrrandi valemiga.', 'Kirjutan murdvõrrandi lubamatud väärtused.', 'Kontrollin juurvõrrandi lahendeid.'],
    },
    {
      title: 'Eksponent- ja logaritmvõrrandid',
      ru: 'Показательные и логарифмические уравнения',
      course: 'I, V',
      exam: 'I osa või rakendusülesanne: kasv ja kahanemine protsentides või kordades.',
      can: 'Õpilane lahendab eksponent- ja logaritmvõrrandeid ning kasutab neid kasvu ülesandes.',
      theory: [
        r`$a^x=a^y\;\Rightarrow\;x=y$`,
        r`$\log_a b=c\;\Leftrightarrow\;a^c=b$; $\;\lg x=\log_{10}x$, $\;\ln x=\log_e x$`,
        r`$\log_a(xy)=\log_a x+\log_a y$, $\;\log_a\dfrac{x}{y}=\log_a x-\log_a y$, $\;\log_a x^n=n\log_a x$`,
        r`Logaritmi all peab olema **positiivne** arv: kontrolli lahendeid.`,
      ],
      ru_hint: [
        'Приведи обе части к одному основанию: 4 = 2², 8 = 2³, 1/3 = 3⁻¹.',
        'Правил логарифмов нет на листе формул — выучи их.',
        'Выражение под логарифмом должно быть больше нуля.',
      ],
      example: {
        task: r`Lahenda $3^{x+1}=81$.`,
        steps: [r`$81=3^4$, seega $3^{x+1}=3^4$.`, r`$x+1=4$, $x=3$.`],
      },
      practice: [
        { title: 'Lahenda eksponentvõrrand.', parts: [
          [r`$2^x=32$`, 1, '5', r`$32=2^5$`],
          [r`$5^{2x-1}=125$`, 1, '2', r`$2x-1=3$`],
          [r`$4^x=8$`, 1, '1,5', r`$2^{2x}=2^3$, $2x=3$`],
          [r`$\left(\frac13\right)^x=9$`, 1, '-2', r`$3^{-x}=3^2$, $x=-2$`],
        ] },
        { title: 'Arvuta või lahenda.', parts: [
          [r`$\log_2 16$`, 1, '4', r`$2^4=16$`],
          [r`$\lg 0{,}001$`, 1, '-3', r`$10^{-3}=0{,}001$`],
          [r`$\log_3 x=2$`, 1, '9', r`$x=3^2$`],
          [r`$\lg(x-1)=1$`, 1, '11', r`$x-1=10$`],
        ] },
        { title: 'Lahenda logaritmvõrrand.', parts: [
          [r`$\lg x+\lg(x-3)=1$`, 3, '5', r`$\lg x(x-3)=1$, $x^2-3x=10$, $x=5$ või $x=-2$. Peab olema $x>3$, seega $x=5$.`, 6],
          [r`$\log_2(x+1)-\log_2(x-1)=1$`, 3, '3', r`$\dfrac{x+1}{x-1}=2$, $x+1=2x-2$, $x=3$ (sobib: $x>1$).`, 6],
        ] },
        { title: 'Too ühine tegur sulgude ette.', parts: [
          [r`$2^{x+2}+2^x=40$`, 3, '3', r`$2^x(2^2+1)=40$, $5\cdot2^x=40$, $2^x=8$, $x=3$.`, 5],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Bakterite arv kahekordistub iga 3 tunni järel. Alguses on baktereid 500.', parts: [
        ['Mitu bakterit on 12 tunni pärast?', 3, '8000', r`12 tunniga kahekordistub $12:3=4$ korda: $500\cdot2^4=8000$.`, 4],
        [r`Kirjuta valem bakterite arvu $N$ leidmiseks $t$ tunni pärast.`, 2, '', r`$N(t)=500\cdot2^{\frac{t}{3}}$`, 2],
        ['Mitme tunni pärast on baktereid 64 000?', 5, '21', r`$500\cdot2^{\frac t3}=64\,000$, $2^{\frac t3}=128=2^7$, $\frac t3=7$, $t=21$.`, 6],
      ] },
      self: ['Viin astmed ühele alusele.', 'Kasutan logaritmi reegleid.', 'Kontrollin, et logaritmi all on positiivne arv.'],
    },
    {
      title: 'Protsendid ja liitintress',
      ru: 'Проценты и сложные проценты',
      course: 'I',
      exam: 'I osa, 5-punktiline ülesanne: hinnamuutus, hoius, väärtuse langus.',
      can: 'Õpilane arvutab protsenti, muutust protsentides ja mitmekordset muutust kordajaga.',
      theory: [
        r`$p\%$ arvust $a$: $\;a\cdot\dfrac{p}{100}$`,
        r`Muutus protsentides: $\dfrac{\text{uus}-\text{vana}}{\text{vana}}\cdot100\%$`,
        r`Tõus $p\%$: korruta $\left(1+\dfrac{p}{100}\right)$-ga; langus $p\%$: korruta $\left(1-\dfrac{p}{100}\right)$-ga.`,
        r`Liitintress: $K=K_0\left(1+\dfrac{p}{100}\right)^n$`,
      ],
      ru_hint: [
        'Рост на 15 % = умножить на 1,15; снижение на 15 % = умножить на 0,85.',
        'Процент изменения всегда считают от старого значения.',
        'Округляй только в конце, деньги — до центов.',
      ],
      example: {
        task: 'Hinda 80 € tõsteti 15%, seejärel alandati 15%. Mis on lõpphind?',
        steps: [r`$80\cdot1{,}15\cdot0{,}85=78{,}2$`, 'Lõpphind on 78,20 € — mitte 80 €, sest alandus arvutati suuremast hinnast.'],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          ['18% arvust 250', 1, '45', r`$250\cdot0{,}18=45$`],
          ['Mitu protsenti on 36 arvust 48?', 1, '75', r`$\dfrac{36}{48}\cdot100\%=75\%$`],
          ['Leia arv, mille 40% on 26.', 1, '65', r`$26:0{,}4=65$`],
        ] },
        { title: 'Telefoni hind oli 450 €, soodushind on 378 €. Mitu protsenti hinda alandati?', parts: [
          ['', 2, '16', r`$\dfrac{450-378}{450}\cdot100\%=\dfrac{72}{450}\cdot100\%=16\%$`],
        ] },
        { title: 'Hoiusele pannakse 2000 € 3% aastase liitintressiga. Kui palju on hoiusel 5 aasta pärast?', parts: [
          ['', 2, '2318,55', r`$2000\cdot1{,}03^5\approx2318{,}55$ €`],
        ] },
        { title: 'Uue auto hind on 24 000 €. Auto väärtus langeb igal aastal 12%.', parts: [
          ['Kui palju on auto väärt 3 aasta pärast?', 2, '16355,33', r`$24\,000\cdot0{,}88^3\approx16\,355{,}33$ €`],
          ['Mitu protsenti esialgsest väärtusest on 3 aastaga kaotatud?', 2, '31,85', r`$1-0{,}88^3\approx0{,}3185$, seega $31{,}85\%$.`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (5 punkti)', context: 'Kauba hind tõusis 20%, seejärel langes uus hind 20%.', parts: [
        ['Mitu protsenti algsest hinnast on lõpphind?', 3, '96', r`$1{,}2\cdot0{,}8=0{,}96$, seega $96\%$.`, 4],
        ['Mitu protsenti peaks lõpphinda tõstma, et jõuda tagasi algse hinnani?', 2, '4,17', r`$1:0{,}96\approx1{,}0417$, seega umbes $4{,}17\%$.`, 3],
      ] },
      self: ['Kasutan kordajat 1 + p/100 ja 1 − p/100.', 'Arvutan muutuse vanast väärtusest.', 'Kasutan liitintressi valemit.'],
    },
    {
      title: 'Siinus ja koosinus kraadides',
      ru: 'Синус и косинус в градусах',
      course: 'II, V',
      exam: 'II osa: trigonomeetrilise funktsiooni graafik lõigul [0°; 360°], nullkohad, lõikepunktid.',
      can: 'Õpilane lahendab lihtsamaid trigonomeetrilisi võrrandeid lõigul [0°; 360°] ning loeb ja joonestab sin- ja cos-graafikut.',
      theory: [
        r`$\sin^2\alpha+\cos^2\alpha=1$, $\;\tan\alpha=\dfrac{\sin\alpha}{\cos\alpha}$ — need on valemilehel.`,
        r`$\sin x=a$: $\;x_1$ kalkulaatorist, $\;x_2=180^\circ-x_1$`,
        r`$\cos x=a$: $\;x_1$ kalkulaatorist, $\;x_2=360^\circ-x_1$`,
        r`Väärtused: $\sin30^\circ=\cos60^\circ=\frac12$, $\;\sin90^\circ=1$, $\;\cos180^\circ=-1$`,
      ],
      ru_hint: [
        'Калькулятор должен стоять в режиме градусов (DEG).',
        'Синус положителен в I и II четвертях, косинус — в I и IV.',
        'График: синус начинается с 0, косинус — с 1; период 360°.',
      ],
      example: {
        task: r`Lahenda $\sin x=0{,}5$, kui $0^\circ\le x\le360^\circ$.`,
        steps: [r`$x_1=30^\circ$ (kalkulaator: $\sin^{-1}0{,}5$).`, r`$x_2=180^\circ-30^\circ=150^\circ$.`, r`Vastus: $x=30^\circ$ või $x=150^\circ$.`],
        graph: { fns: 'y = sin(x)\ny = cos(x)', angle: 'deg', xmin: 0, xmax: 360, ymin: -1.5, ymax: 1.5, step: 30, stepY: 0.5, labelEvery: 3, caption: 'tumesinine: y = sin x · roheline: y = cos x' },
      },
      practice: [
        { title: 'Lahenda lõigul [0°; 360°].', parts: [
          [r`$\cos x=0{,}5$`, 2, '60; 300', r`$x_1=60^\circ$, $x_2=360^\circ-60^\circ=300^\circ$`],
          [r`$\sin x=-1$`, 1, '270', r`Siinus on $-1$ ainult $270^\circ$ juures.`],
          [r`$\tan x=1$`, 2, '45; 225', r`$x_1=45^\circ$; tangensi periood on $180^\circ$: $x_2=225^\circ$.`],
        ] },
        { title: r`On teada, et $\sin\alpha=0{,}6$ ja $\alpha$ on teravnurk.`, parts: [
          [r`Leia $\cos\alpha$.`, 2, '0,8', r`$\cos\alpha=\sqrt{1-0{,}36}=0{,}8$ (teravnurk, seega positiivne).`],
          [r`Leia $\tan\alpha$.`, 1, '0,75', r`$\dfrac{0{,}6}{0{,}8}=0{,}75$`],
        ] },
        { title: r`Funktsioon $y=2\sin x$ lõigul [0°; 360°].`, parts: [
          ['Leia funktsiooni suurim väärtus.', 1, '2', r`$\sin x\le1$, seega $2\sin x\le2$ (kohal $90^\circ$).`],
          ['Leia nullkohad.', 2, '0; 180; 360', r`$\sin x=0$: $0^\circ$, $180^\circ$, $360^\circ$.`],
          ['Kirjuta kasvamisvahemikud.', 2, '', r`$0^\circ<x<90^\circ$ ja $270^\circ<x<360^\circ$.`],
        ] },
        { title: 'Lahenda lõigul [0°; 360°].', parts: [
          [r`$2\cos x-1=0$`, 2, '60; 300', r`$\cos x=0{,}5$: $x=60^\circ$ või $x=300^\circ$.`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioonid $f(x)=\sin x$ ja $g(x)=\cos x$ lõigul $[0^\circ;360^\circ]$.`, grid: { angle: 'deg', xmin: 0, xmax: 360, ymin: -1.5, ymax: 1.5, step: 30, stepY: 0.5, labelEvery: 3, blank: true }, parts: [
        ['Joonesta mõlema funktsiooni graafik ühes teljestikus.', 3, '', 'Siinus: 0 → 1 (90°) → 0 (180°) → −1 (270°) → 0. Koosinus: 1 → 0 (90°) → −1 (180°) → 0 (270°) → 1.', 0],
        ['Leia graafikute lõikepunktide abstsissid.', 3, '45; 225', r`$\sin x=\cos x\Rightarrow\tan x=1$: $x=45^\circ$ või $x=225^\circ$.`, 4],
        [r`Leia vahemik, kus $\sin x>\cos x$.`, 2, '45<x<225|(45;225)', r`Lõikepunktide vahel on siinus suurem: $45^\circ<x<225^\circ$.`, 2],
        [r`Arvuta $f(120^\circ)+g(120^\circ)$ kahe kümnendkohani.`, 2, '0,37', r`$\frac{\sqrt3}{2}-\frac12\approx0{,}866-0{,}5\approx0{,}37$`, 2],
      ] },
      self: ['Leian kaks lahendit lõigul [0°; 360°].', 'Joonestan sin- ja cos-graafiku.', 'Kasutan kalkulaatorit kraadides.'],
    },
    {
      title: 'Kolmnurga lahendamine',
      ru: 'Решение треугольников',
      course: 'II, VII',
      exam: 'Kolmnurk: siinus- ja koosinusteoreem, pindala, ümbermõõt (sageli rakendusülesanne).',
      can: 'Õpilane leiab kolmnurga küljed, nurgad ja pindala siinus- ja koosinusteoreemiga.',
      theory: [
        r`Siinusteoreem: $\dfrac{a}{\sin\alpha}=\dfrac{b}{\sin\beta}=\dfrac{c}{\sin\gamma}$`,
        r`Koosinusteoreem: $c^2=a^2+b^2-2ab\cos\gamma$`,
        r`Pindala: $S=\dfrac12ab\sin\gamma$; $\;$ täisnurkne: $\sin\alpha=\dfrac{\text{vastaskaatet}}{\text{hüpotenuus}}$`,
        r`Nurkade summa $180^\circ$; suurima külje vastas on suurim nurk.`,
      ],
      ru_hint: [
        'Теоремы синусов и косинусов нет на листе формул — выучи их.',
        'Две стороны и угол между ними → теорема косинусов; сторона и два угла → теорема синусов.',
        'Площадь: половина произведения двух сторон на синус угла между ними.',
      ],
      example: {
        task: r`Kolmnurgas $a=5$, $b=7$, $\gamma=60^\circ$. Leia $c$.`,
        steps: [r`$c^2=25+49-2\cdot5\cdot7\cdot\cos60^\circ=74-35=39$`, r`$c=\sqrt{39}\approx6{,}24$`],
      },
      practice: [
        { title: 'Täisnurkse kolmnurga hüpotenuus on 10 cm ja üks teravnurk 30°.', parts: [
          ['Leia 30° nurga vastaskaatet.', 1, '5', r`$10\cdot\sin30^\circ=5$`],
          ['Leia teine kaatet (kahe kümnendkohani).', 2, '8,66', r`$10\cdot\cos30^\circ\approx8{,}66$`],
        ] },
        { title: r`Kolmnurgas $a=8$, $b=6$ ja $\gamma=120^\circ$.`, parts: [
          [r`Leia külg $c$.`, 2, '12,17', r`$c^2=64+36-96\cos120^\circ=100+48=148$, $c\approx12{,}17$`],
          ['Leia pindala.', 2, '20,78', r`$S=\frac12\cdot8\cdot6\cdot\sin120^\circ\approx20{,}78$`],
        ] },
        { title: r`Kolmnurgas $a=10$, $\alpha=40^\circ$ ja $\beta=65^\circ$.`, parts: [
          [r`Leia $\gamma$.`, 1, '75', r`$180^\circ-40^\circ-65^\circ=75^\circ$`],
          [r`Leia $b$ (ühe kümnendkohani).`, 2, '14,1', r`$b=\dfrac{10\sin65^\circ}{\sin40^\circ}\approx14{,}1$`],
          [r`Leia $c$.`, 2, '15,03', r`$c=\dfrac{10\sin75^\circ}{\sin40^\circ}\approx15{,}03$`],
        ] },
        { title: 'Kolmnurga küljed on 5, 6 ja 7.', parts: [
          ['Leia suurim nurk.', 3, '78,46', r`Suurim nurk on külje 7 vastas: $\cos\gamma=\dfrac{25+36-49}{2\cdot5\cdot6}=0{,}2$, $\gamma\approx78{,}46^\circ$.`, 4],
          ['Leia pindala.', 2, '14,7', r`$\sin\gamma=\sqrt{1-0{,}04}\approx0{,}9798$, $S=\frac12\cdot5\cdot6\cdot0{,}9798\approx14{,}7$.`, 3],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Maatükk on kolmnurga $ABC$ kujuline: $AB=120$ m, $AC=85$ m ja $\angle A=52^\circ$.`, parts: [
        [r`Leia külje $BC$ pikkus.`, 4, '95,21|95,2', r`$BC^2=120^2+85^2-2\cdot120\cdot85\cdot\cos52^\circ\approx9065{,}5$, $BC\approx95{,}21$ m.`, 6],
        ['Leia maatüki pindala.', 3, '4018,86|4019', r`$S=\frac12\cdot120\cdot85\cdot\sin52^\circ\approx4018{,}86$ m².`, 4],
        ['Maatükk piiratakse aiaga, mille meeter maksab 9,50 €. Kui palju maksab aed?', 3, '2852|2851,9', r`Ümbermõõt $120+85+95{,}21=300{,}21$ m; $300{,}21\cdot9{,}5\approx2852$ €.`, 4],
      ] },
      self: ['Valin siinus- või koosinusteoreemi.', 'Arvutan kolmnurga pindala.', 'Kontrollin, et nurkade summa on 180°.'],
    },
    {
      title: 'Vektorid ja sirge võrrand',
      ru: 'Векторы и уравнение прямой',
      course: 'III',
      exam: 'Koordinaatgeomeetria: vektor, pikkus, sirge võrrand, lõikepunkt, ristseis.',
      can: 'Õpilane arvutab vektori koordinaadid ja pikkuse, koostab sirge võrrandi ja leiab sirgete lõikepunkti.',
      theory: [
        r`$\overrightarrow{AB}=(x_2-x_1;\;y_2-y_1)$, $\;|\overrightarrow{AB}|=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$`,
        r`Lõigu keskpunkt: $\left(\dfrac{x_1+x_2}{2};\dfrac{y_1+y_2}{2}\right)$`,
        r`Skalaarkorrutis $\vec a\cdot\vec b=a_1b_1+a_2b_2$; $\;\vec a\perp\vec b\Leftrightarrow\vec a\cdot\vec b=0$`,
        r`Sirge $y=kx+b$, $\;k=\dfrac{y_2-y_1}{x_2-x_1}$; paralleelsed $k_1=k_2$, ristuvad $k_1k_2=-1$`,
      ],
      ru_hint: [
        'Координаты вектора: из конца вычитаем начало.',
        'Перпендикулярность проверяй скалярным произведением: оно равно нулю.',
        'Точку пересечения прямых находят из системы уравнений.',
      ],
      example: {
        task: r`Punktid $A(1;2)$ ja $B(5;4)$. Leia $\overrightarrow{AB}$, selle pikkus ja sirge $AB$ võrrand.`,
        steps: [r`$\overrightarrow{AB}=(4;2)$, $|\overrightarrow{AB}|=\sqrt{16+4}=\sqrt{20}\approx4{,}47$`, r`$k=\dfrac{2}{4}=0{,}5$; $2=0{,}5\cdot1+b$, $b=1{,}5$`, r`Sirge: $y=0{,}5x+1{,}5$`],
        graph: { fns: 'y = 0.5x + 1.5', xmin: -1, xmax: 7, ymin: -1, ymax: 6, step: 1, points: 'A(1; 2)\nB(5; 4)', segments: 'A-B' },
      },
      practice: [
        { title: r`Punktid $A(-2;3)$ ja $B(4;-5)$.`, parts: [
          [r`Leia $\overrightarrow{AB}$.`, 1, '(6;-8)', r`$(4-(-2);\,-5-3)=(6;-8)$`],
          [r`Leia $|AB|$.`, 1, '10', r`$\sqrt{36+64}=10$`],
          ['Leia lõigu AB keskpunkt.', 1, '(1;-1)', r`$\left(\frac{-2+4}{2};\frac{3-5}{2}\right)=(1;-1)$`],
        ] },
        { title: r`Koosta punkte $C(2;1)$ ja $D(4;7)$ läbiva sirge võrrand.`, parts: [
          ['', 2, 'y=3x-5', r`$k=\dfrac{7-1}{4-2}=3$; $1=3\cdot2+b$, $b=-5$: $y=3x-5$.`],
        ] },
        { title: r`Vektorid $\vec a=(3;-2)$ ja $\vec b=(4;6)$.`, parts: [
          ['Arvuta skalaarkorrutis.', 1, '0', r`$3\cdot4+(-2)\cdot6=0$`],
          ['Kas vektorid on risti? Kirjuta jah või ei.', 1, 'jah', 'Skalaarkorrutis on 0, seega on vektorid risti.'],
        ] },
        { title: r`Leia sirgete $y=2x-1$ ja $y=-x+5$ lõikepunkt.`, parts: [
          ['', 2, '(2;3)', r`$2x-1=-x+5$, $x=2$, $y=3$.`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Kolmnurga tipud on $A(-1;1)$, $B(5;3)$ ja $C(3;9)$.`, grid: { xmin: -2, xmax: 7, ymin: -1, ymax: 10, step: 1, blank: true }, parts: [
        ['Leia külje AB pikkus kahe kümnendkohani.', 2, '6,32', r`$\overrightarrow{AB}=(6;2)$, $|AB|=\sqrt{40}\approx6{,}32$`, 3],
        ['Koosta sirge AB võrrand.', 3, 'y=x/3+4/3|y=(1/3)x+4/3', r`$k=\frac26=\frac13$; $1=\frac13\cdot(-1)+b$, $b=\frac43$: $y=\frac13x+\frac43$.`, 4],
        ['Näita skalaarkorrutisega, et kolmnurk on täisnurkne. Millise tipu juures on täisnurk?', 3, 'B', r`$\overrightarrow{BA}=(-6;-2)$, $\overrightarrow{BC}=(-2;6)$: $12-12=0$, seega täisnurk on tipus $B$.`, 4],
        ['Leia kolmnurga pindala.', 2, '20', r`$|BC|=\sqrt{40}$; $S=\frac12\cdot\sqrt{40}\cdot\sqrt{40}=20$.`, 3],
      ] },
      self: ['Leian vektori koordinaadid ja pikkuse.', 'Koostan sirge võrrandi kahe punkti järgi.', 'Kontrollin ristseisu skalaarkorrutisega.'],
    },
    {
      title: 'Tõenäosus ja statistika',
      ru: 'Вероятность и статистика',
      course: 'IV',
      exam: 'Tõenäosus, kombinatsioonid, keskväärtus ja jaotustabel.',
      can: 'Õpilane arvutab sündmuse tõenäosuse, kombinatsioonide arvu, keskmise, mediaani ja keskväärtuse.',
      theory: [
        r`$P(A)=\dfrac{m}{n}$ (soodsad / kõik võrdvõimalikud); $\;P(\bar A)=1-P(A)$`,
        r`Sõltumatud sündmused: $P(A\text{ ja }B)=P(A)\cdot P(B)$`,
        r`Kombinatsioonid: $C_n^k=\dfrac{n!}{k!\,(n-k)!}$`,
        r`Keskväärtus $E(X)=x_1p_1+x_2p_2+\dots+x_np_n$; mediaan = keskmine liige järjestatud reas.`,
      ],
      ru_hint: [
        '«Хотя бы один» удобнее считать через противоположное событие: 1 − P(ни одного).',
        'Без возвращения число вариантов уменьшается на каждом шаге.',
        'Сумма вероятностей в таблице распределения равна 1.',
      ],
      example: {
        task: 'Visatakse kahte täringut. Kui suur on tõenäosus, et silmade summa on 7?',
        steps: ['Kõiki võimalusi on $6\\cdot6=36$.', 'Soodsad: (1;6), (2;5), (3;4), (4;3), (5;2), (6;1) — 6 tükki.', r`$P=\dfrac{6}{36}=\dfrac16\approx0{,}17$`],
      },
      practice: [
        { title: 'Karbis on 5 punast, 3 sinist ja 2 valget kuuli.', parts: [
          ['Kui suur on tõenäosus võtta punane kuul?', 1, '0,5', r`$\frac{5}{10}=0{,}5$`],
          ['Kui suur on tõenäosus, et kuul ei ole valge?', 1, '0,8', r`$1-\frac{2}{10}=0{,}8$`],
          ['Võetakse järjest kaks kuuli tagasi panemata. Kui suur on tõenäosus, et mõlemad on punased?', 2, '0,22|2/9', r`$\frac{5}{10}\cdot\frac49=\frac29\approx0{,}22$`],
        ] },
        { title: 'Mitmel viisil saab 12 õpilase seast valida 3-liikmelise võistkonna?', parts: [
          ['', 2, '220', r`$C_{12}^3=\dfrac{12\cdot11\cdot10}{3\cdot2\cdot1}=220$`],
        ] },
        { title: 'Andmed: 4, 7, 7, 8, 9, 10, 11.', parts: [
          ['Leia aritmeetiline keskmine.', 1, '8', r`$56:7=8$`],
          ['Leia mediaan.', 1, '8', 'Järjestatud rea keskmine (4.) liige on 8.'],
          ['Leia mood.', 1, '7', 'Kõige sagedamini esineb 7.'],
        ] },
        { title: 'Laskur tabab märki tõenäosusega 0,8. Ta laseb kolm korda.', parts: [
          ['Kui suur on tõenäosus, et kõik kolm lasku tabavad?', 1, '0,512', r`$0{,}8^3=0{,}512$`],
          ['Kui suur on tõenäosus, et vähemalt üks lask tabab?', 2, '0,992', r`$1-0{,}2^3=0{,}992$`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Loteriil on 1000 piletit: 1 võit 200 €, 10 võitu 50 €, 50 võitu 5 €, ülejäänud piletid ei võida.', parts: [
        ['Kui suur on tõenäosus, et juhuslikult ostetud pilet võidab?', 2, '0,061', r`$\frac{1+10+50}{1000}=0{,}061$`, 2],
        ['Koosta võidusumma jaotustabel.', 3, '', 'X: 0 | 5 | 50 | 200; p: 0,939 | 0,05 | 0,01 | 0,001 (summa 1).', 4],
        ['Arvuta võidusumma keskväärtus.', 3, '0,95', r`$0\cdot0{,}939+5\cdot0{,}05+50\cdot0{,}01+200\cdot0{,}001=0{,}95$ €`, 3],
        ['Pilet maksab 2 €. Kas pileti ostmine on keskmiselt kasulik? Kirjuta jah või ei.', 2, 'ei', 'Keskmine võit 0,95 € < 2 €: keskmiselt kaotab ostja 1,05 €.', 2],
      ] },
      self: ['Arvutan tõenäosuse soodsate ja kõigi võimaluste kaudu.', 'Kasutan vastandsündmust.', 'Arvutan keskväärtuse jaotustabelist.'],
    },
    {
      title: 'Aritmeetiline ja geomeetriline jada',
      ru: 'Арифметическая и геометрическая прогрессия',
      course: 'VI',
      exam: 'II osa: jada tekstülesanne (treening, säästmine, istmeread).',
      can: 'Õpilane leiab jada liikme ja summa ning lahendab jadaga tekstülesande.',
      theory: [
        r`Aritmeetiline: $a_n=a_1+(n-1)d$, $\;S_n=\dfrac{(a_1+a_n)n}{2}$`,
        r`Geomeetriline: $b_n=b_1q^{n-1}$, $\;S_n=\dfrac{b_1(q^n-1)}{q-1}$`,
        r`Hääbuv geomeetriline jada ($|q|<1$): $\;S=\dfrac{b_1}{1-q}$`,
      ],
      ru_hint: [
        'Арифметическая: каждый раз прибавляем d; геометрическая: каждый раз умножаем на q.',
        'Формул прогрессий нет на листе формул — выучи их.',
        'В текстовой задаче сначала выпиши a₁, d (или q) и n.',
      ],
      example: {
        task: r`Jada $3, 7, 11, \dots$ Leia $a_{20}$ ja $S_{20}$.`,
        steps: [r`$d=4$, $a_{20}=3+19\cdot4=79$`, r`$S_{20}=\dfrac{(3+79)\cdot20}{2}=820$`],
      },
      practice: [
        { title: r`Aritmeetilises jadas $a_1=5$ ja $d=3$.`, parts: [
          [r`Leia $a_{15}$.`, 1, '47', r`$5+14\cdot3=47$`],
          [r`Leia $S_{15}$.`, 2, '390', r`$\dfrac{(5+47)\cdot15}{2}=390$`],
        ] },
        { title: r`Aritmeetilises jadas $a_3=10$ ja $a_7=22$.`, parts: [
          [r`Leia $d$.`, 2, '3', r`$a_7-a_3=4d=12$, $d=3$`],
          [r`Leia $a_1$.`, 1, '4', r`$a_1=a_3-2d=4$`],
        ] },
        { title: r`Geomeetriline jada $2, 6, 18, \dots$`, parts: [
          [r`Leia $b_6$.`, 1, '486', r`$q=3$, $b_6=2\cdot3^5=486$`],
          [r`Leia $S_6$.`, 2, '728', r`$\dfrac{2(3^6-1)}{3-1}=728$`],
        ] },
        { title: r`Leia hääbuva geomeetrilise jada $16, 8, 4, \dots$ summa.`, parts: [
          ['', 2, '32', r`$q=\frac12$, $S=\dfrac{16}{1-\frac12}=32$`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Jooksja jookseb esimesel nädalal igal treeningul 3 km. Igal järgmisel nädalal pikendab ta treeningut 0,5 km võrra. Nädalas on 3 treeningut.', parts: [
        ['Mitu kilomeetrit jookseb ta ühel treeningul 10. nädalal?', 3, '7,5', r`$a_{10}=3+9\cdot0{,}5=7{,}5$ km`, 4],
        ['Mitu kilomeetrit jookseb ta kokku 10 nädalaga?', 4, '157,5', r`Ühe treeningu kilomeetrite summa 10 nädalaga: $\frac{(3+7{,}5)\cdot10}{2}=52{,}5$; kolm treeningut nädalas: $3\cdot52{,}5=157{,}5$ km.`, 5],
        ['Mitmendal nädalal on ühe treeningu pikkus esimest korda üle 10 km?', 3, '16', r`$3+(n-1)\cdot0{,}5>10$, $n-1>14$, $n>15$: 16. nädalal (10,5 km).`, 4],
      ] },
      self: ['Eristan aritmeetilist ja geomeetrilist jada.', 'Leian liikme ja summa.', 'Kirjutan tekstülesandes välja a₁, d ja n.'],
    },
    {
      title: 'Tuletis ja puutuja',
      ru: 'Производная и касательная',
      course: 'VI',
      exam: 'II osa: funktsiooni tuletis, puutuja võrrand, kiirus.',
      can: 'Õpilane leiab polünoomi tuletise, tuletise väärtuse ja puutuja võrrandi.',
      theory: [
        r`$(x^n)'=nx^{n-1}$, $\;(c)'=0$, $\;(cf)'=cf'$, $\;(f\pm g)'=f'\pm g'$ — tuletiste tabel on valemilehel.`,
        r`Puutuja tõus kohal $a$: $\;k=f'(a)$`,
        r`Puutuja võrrand: $\;y-f(a)=f'(a)(x-a)$`,
        r`Kiirus on teepikkuse tuletis: $v(t)=s'(t)$.`,
      ],
      ru_hint: [
        'Касательная: сначала найди f(a) и f\'(a), потом подставь в уравнение.',
        'Касательная параллельна оси x, когда f\'(x) = 0.',
        'Таблица производных есть на листе формул.',
      ],
      example: {
        task: r`$f(x)=x^3-3x$. Koosta puutuja võrrand kohal $x=2$.`,
        steps: [r`$f(2)=8-6=2$; $f'(x)=3x^2-3$, $f'(2)=9$`, r`$y-2=9(x-2)$, seega $y=9x-16$.`],
        graph: { fns: 'y = x^3 - 3x\ny = 9x - 16', xmin: -3, xmax: 3, ymin: -6, ymax: 8, step: 1, stepY: 2, points: 'P(2; 2)' },
      },
      practice: [
        { title: 'Leia tuletis.', parts: [
          [r`$f(x)=4x^3-2x+7$`, 1, '12x^2-2|12x²-2', r`$12x^2-2$`],
          [r`$f(x)=\dfrac{x^5}{5}$`, 1, 'x^4|x⁴', r`$\frac{5x^4}{5}=x^4$`],
          [r`$f(x)=x^2-5x$; leia $f'(2)$.`, 1, '-1', r`$f'(x)=2x-5$, $f'(2)=-1$`],
        ] },
        { title: r`Koosta funktsiooni $f(x)=x^2-4x+1$ puutuja võrrand kohal $x=3$.`, parts: [
          ['', 3, 'y=2x-8', r`$f(3)=-2$, $f'(x)=2x-4$, $f'(3)=2$: $y+2=2(x-3)$, $y=2x-8$.`, 4],
        ] },
        { title: r`Millises punktis on funktsiooni $f(x)=x^2-6x$ puutuja paralleelne x-teljega?`, parts: [
          ['', 2, '(3;-9)', r`$f'(x)=2x-6=0$, $x=3$, $f(3)=-9$.`],
        ] },
        { title: r`Keha teepikkus on $s(t)=t^3-6t^2+15t$ (meetrites, $t$ sekundites).`, parts: [
          ['Leia kiirus hetkel t = 2 s.', 2, '3', r`$v(t)=3t^2-12t+15$, $v(2)=12-24+15=3$ m/s`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^3-3x^2+2$.`, parts: [
        [r`Leia $f'(x)$.`, 2, '3x^2-6x|3x²-6x', r`$f'(x)=3x^2-6x$`, 2],
        [r`Koosta puutuja võrrand kohal $x=1$.`, 4, 'y=-3x+3', r`$f(1)=0$, $f'(1)=-3$: $y=-3(x-1)=-3x+3$.`, 5],
        ['Leia graafiku punktid, kus puutuja tõus on 9.', 4, '(3;2); (-1;-2)', r`$3x^2-6x=9$, $x^2-2x-3=0$, $x=3$ või $x=-1$; $f(3)=2$, $f(-1)=-2$: punktid $(3;2)$ ja $(-1;-2)$.`, 5],
      ] },
      self: ['Leian polünoomi tuletise.', 'Koostan puutuja võrrandi.', 'Leian punkti, kus puutuja on antud tõusuga.'],
    },
    {
      title: 'Funktsiooni uurimine',
      ru: 'Исследование функции',
      course: 'V, VI',
      exam: 'II osa: kuupfunktsioon — nullkohad, ekstreemumid, kasvamine, graafik; optimeerimine.',
      can: 'Õpilane leiab funktsiooni nullkohad, ekstreemumid ning kasvamis- ja kahanemisvahemikud ja skitseerib graafiku.',
      theory: [
        r`Nullkohad: $f(x)=0$. Statsionaarsed punktid: $f'(x)=0$.`,
        r`$f'(x)>0$ — funktsioon kasvab; $f'(x)<0$ — kahaneb.`,
        r`Kui $f'$ muudab märki $+\to-$, on maksimum; $-\to+$ — miinimum.`,
        'Optimeerimine: kirjuta suurus ühe muutuja funktsioonina ja leia selle ekstreemum.',
      ],
      ru_hint: [
        'Экстремум — там, где производная равна нулю и меняет знак.',
        'Для эскиза графика: нули, экстремумы, поведение по краям.',
        'Задача на наибольшее/наименьшее: составь функцию одной переменной.',
      ],
      example: {
        task: r`Uuri funktsiooni $f(x)=x^3-3x$.`,
        steps: [r`$f'(x)=3x^2-3=0$, $x=\pm1$.`, r`$f(-1)=2$ — maksimum; $f(1)=-2$ — miinimum.`, r`Kasvab $x<-1$ ja $x>1$; kahaneb $-1<x<1$. Nullkohad $0$ ja $\pm\sqrt3$.`],
        graph: { fns: 'y = x^3 - 3x', xmin: -3, xmax: 3, ymin: -4, ymax: 4, step: 1, points: 'M(-1; 2)\nN(1; -2)' },
      },
      practice: [
        { title: r`Funktsioon $f(x)=x^2-6x+5$.`, parts: [
          ['Leia nullkohad.', 1, '1; 5', r`$x^2-6x+5=0$: $x=1$, $x=5$`],
          ['Leia haripunkt.', 2, '(3;-4)', r`$x=-\frac{b}{2a}=3$, $f(3)=-4$`],
          ['Millises vahemikus funktsioon kahaneb?', 1, 'x<3|(-∞;3)', r`$f'(x)=2x-6<0$, kui $x<3$.`],
        ] },
        { title: r`Leia funktsiooni $f(x)=2x^3-6x$ ekstreemumpunktid.`, parts: [
          ['Maksimumpunkt', 2, '(-1;4)', r`$f'(x)=6x^2-6=0$, $x=\pm1$; $f(-1)=4$`],
          ['Miinimumpunkt', 2, '(1;-4)', r`$f(1)=-4$`],
        ] },
        { title: r`Funktsioon $f(x)=-x^3+3x^2$.`, parts: [
          ['Leia ekstreemumkohad.', 2, '0; 2', r`$f'(x)=-3x^2+6x=-3x(x-2)=0$`],
          ['Millises vahemikus funktsioon kasvab?', 2, '0<x<2|(0;2)', r`$f'(x)>0$, kui $0<x<2$.`],
        ] },
        { title: 'Ristküliku ümbermõõt on 40 cm. Milline on suurim võimalik pindala?', parts: [
          ['', 3, '100', r`Küljed $x$ ja $20-x$; $S(x)=20x-x^2$, $S'(x)=20-2x=0$, $x=10$; $S=100$ cm² (ruut).`, 5],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^3-6x^2+9x$.`, grid: { xmin: -1, xmax: 5, ymin: -2, ymax: 6, step: 1, blank: true }, parts: [
        ['Leia funktsiooni nullkohad.', 2, '0; 3', r`$x(x^2-6x+9)=x(x-3)^2=0$: $x=0$, $x=3$.`, 2],
        ['Leia maksimumpunkt ja miinimumpunkt (kirjuta: maksimumpunkt; miinimumpunkt).', 4, '(1;4); (3;0)', r`$f'(x)=3x^2-12x+9=3(x-1)(x-3)$; $f(1)=4$ maksimum, $f(3)=0$ miinimum.`, 5],
        ['Kirjuta kasvamis- ja kahanemisvahemikud.', 2, '', r`Kasvab $x<1$ ja $x>3$; kahaneb $1<x<3$.`, 2],
        ['Skitseeri graafik.', 2, '', 'Graafik läbib (0; 0), tõuseb punktini (1; 4), langeb punktini (3; 0) ja tõuseb siis.', 0],
      ] },
      self: ['Leian ekstreemumid tuletise abil.', 'Kirjutan kasvamis- ja kahanemisvahemikud.', 'Skitseerin graafiku.'],
    },
    {
      title: 'Integraal ja pindala',
      ru: 'Интеграл и площадь',
      course: 'VII',
      exam: 'II osa: parabool ja x-telg — nullkohad, haripunkt, kujundi pindala integraaliga.',
      can: 'Õpilane leiab algfunktsiooni, arvutab määratud integraali ja kõvertrapetsi pindala.',
      theory: [
        r`$\displaystyle\int x^n\,dx=\frac{x^{n+1}}{n+1}+C$, $\;\displaystyle\int c\,dx=cx+C$`,
        r`Newtoni-Leibnizi valem: $\displaystyle\int_a^b f(x)\,dx=F(b)-F(a)$`,
        r`Kahe joone vaheline pindala: $\displaystyle S=\int_a^b\big(f(x)-g(x)\big)dx$, kus $f$ on ülemine joon.`,
        'Kui kujund on x-teljest allpool, on integraal negatiivne — pindala on selle absoluutväärtus.',
      ],
      ru_hint: [
        'Пределы интегрирования — это обычно нули параболы или точки пересечения графиков.',
        'Формул интегралов нет на листе формул — выучи их.',
        'Сначала нарисуй эскиз: так видно, какая линия сверху.',
      ],
      example: {
        task: r`Leia parabooli $y=-x^2+4$ ja x-telje vahelise kujundi pindala.`,
        steps: [r`Nullkohad $x=\pm2$.`, r`$S=\displaystyle\int_{-2}^{2}(4-x^2)\,dx=\left[4x-\frac{x^3}{3}\right]_{-2}^{2}=\frac{16}{3}-\left(-\frac{16}{3}\right)=\frac{32}{3}\approx10{,}67$`],
        graph: { fns: 'y = -x^2 + 4', xmin: -3, xmax: 3, ymin: -2, ymax: 5, step: 1, shade: '-x^2 + 4; -2; 2' },
      },
      practice: [
        { title: 'Arvuta integraal.', parts: [
          [r`$\displaystyle\int_0^2 3x^2\,dx$`, 1, '8', r`$\left[x^3\right]_0^2=8$`],
          [r`$\displaystyle\int_1^3(2x+1)\,dx$`, 2, '10', r`$\left[x^2+x\right]_1^3=12-2=10$`],
          [r`$\displaystyle\int_0^1(x^3-x)\,dx$`, 2, '-0,25', r`$\left[\frac{x^4}{4}-\frac{x^2}{2}\right]_0^1=\frac14-\frac12=-0{,}25$`],
        ] },
        { title: r`Leia parabooli $y=x^2-4x$ ja x-telje vahelise kujundi pindala.`, parts: [
          ['', 3, '10,67|32/3', r`Nullkohad $0$ ja $4$; parabool on all, seega $S=\displaystyle\int_0^4(4x-x^2)\,dx=32-\frac{64}{3}=\frac{32}{3}\approx10{,}67$.`, 5],
        ] },
        { title: r`Leia joontega $y=x^2$ ja $y=2x$ piiratud kujundi pindala.`, parts: [
          ['', 3, '1,33|4/3', r`$x^2=2x$: $x=0$, $x=2$; ülemine on $2x$: $\displaystyle\int_0^2(2x-x^2)\,dx=4-\frac83=\frac43\approx1{,}33$.`, 5],
        ] },
        { title: r`Leia funktsiooni $f(x)=6x^2-2x$ algfunktsioon $F$, mille korral $F(1)=5$.`, parts: [
          ['', 3, '2x^3-x^2+4|2x³-x²+4', r`$F(x)=2x^3-x^2+C$; $2-1+C=5$, $C=4$.`, 4],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on parabool $y=-x^2+2x+3$.`, grid: { xmin: -2, xmax: 4, ymin: -1, ymax: 5, step: 1, blank: true }, parts: [
        ['Leia parabooli nullkohad.', 2, '3; -1', r`$x^2-2x-3=0$: $x=3$, $x=-1$.`, 2],
        ['Leia haripunkt.', 2, '(1;4)', r`$x=-\frac{2}{2\cdot(-1)}=1$, $y=4$.`, 2],
        ['Arvuta parabooli ja x-teljega piiratud kujundi pindala.', 4, '10,67|32/3', r`$\displaystyle\int_{-1}^{3}(-x^2+2x+3)\,dx=\left[-\frac{x^3}{3}+x^2+3x\right]_{-1}^{3}=9-\left(-\frac53\right)=\frac{32}{3}\approx10{,}67$.`, 5],
        ['Joonesta parabool ja viiruta kujund.', 2, '', 'Parabool läbib punkte (−1; 0), (0; 3), (1; 4), (2; 3), (3; 0).', 0],
      ] },
      self: ['Leian algfunktsiooni.', 'Arvutan määratud integraali.', 'Leian kujundi pindala integraaliga.'],
    },
    {
      title: 'Ruumilised kehad',
      ru: 'Стереометрия: тела',
      course: 'VIII',
      exam: 'II osa: silinder, koonus, püramiid, prisma, kera — ruumala, pindala, nurgad.',
      can: 'Õpilane arvutab kehade ruumala ja pindala ning leiab vajaliku pikkuse täisnurkse kolmnurga abil.',
      theory: [
        r`Prisma $V=S_pH$; $\;$ püramiid $V=\dfrac13S_pH$`,
        r`Silinder $V=\pi r^2H$, $\;S_k=2\pi rH$, $\;S_t=2\pi r(r+H)$`,
        r`Koonus $V=\dfrac13\pi r^2H$, $\;S_k=\pi rs$, $\;s=\sqrt{r^2+H^2}$`,
        r`Kera $V=\dfrac43\pi r^3$, $\;S=4\pi r^2$`,
      ],
      ru_hint: [
        'Формул объёмов и площадей нет на листе формул — выучи их.',
        'Высоту, апофему или образующую находи из прямоугольного треугольника (теорема Пифагора).',
        '1 литр = 1 дм³ = 1000 см³.',
      ],
      example: {
        task: r`Koonuse põhja raadius on 3 ja kõrgus 4. Leia moodustaja, ruumala ja täispindala.`,
        steps: [r`$s=\sqrt{9+16}=5$`, r`$V=\frac13\pi\cdot9\cdot4=12\pi\approx37{,}70$`, r`$S_t=\pi\cdot3\cdot5+\pi\cdot9=24\pi\approx75{,}40$`],
      },
      practice: [
        { title: 'Silindri raadius on 5 cm ja kõrgus 12 cm.', parts: [
          ['Leia ruumala.', 1, '942,48|300π', r`$\pi\cdot25\cdot12=300\pi\approx942{,}48$ cm³`],
          ['Leia täispindala.', 2, '534,07|170π', r`$2\pi\cdot5\cdot(5+12)=170\pi\approx534{,}07$ cm²`],
        ] },
        { title: 'Korrapärase nelinurkse püramiidi põhiserv on 6 ja kõrgus 4.', parts: [
          ['Leia ruumala.', 1, '48', r`$\frac13\cdot36\cdot4=48$`],
          ['Leia külgtahu kõrgus (apoteem).', 2, '5', r`$\sqrt{4^2+3^2}=5$`],
          ['Leia külgpindala.', 2, '60', r`$4\cdot\frac12\cdot6\cdot5=60$`],
        ] },
        { title: 'Kera raadius on 6.', parts: [
          ['Leia ruumala.', 1, '904,78|288π', r`$\frac43\pi\cdot216=288\pi\approx904{,}78$`],
          ['Leia pindala.', 1, '452,39|144π', r`$4\pi\cdot36=144\pi\approx452{,}39$`],
        ] },
        { title: 'Risttahuka mõõtmed on 3, 4 ja 12.', parts: [
          ['Leia ruumdiagonaal.', 2, '13', r`$\sqrt{9+16+144}=13$`],
          ['Leia ruumala.', 1, '144', r`$3\cdot4\cdot12=144$`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Koonusekujulise lehtri põhja läbimõõt on 12 cm ja moodustaja 10 cm.', parts: [
        ['Leia lehtri kõrgus.', 2, '8', r`$r=6$, $H=\sqrt{10^2-6^2}=8$ cm`, 2],
        ['Leia lehtri ruumala.', 3, '301,59|96π', r`$\frac13\pi\cdot36\cdot8=96\pi\approx301{,}59$ cm³`, 3],
        ['Mitu liitrit vett mahub lehtrisse (kahe kümnendkohani)?', 1, '0,3|0,30', r`$301{,}59$ cm³ $\approx0{,}30$ l`, 1],
        ['Leia lehtri külgpindala.', 2, '188,5|60π', r`$\pi\cdot6\cdot10=60\pi\approx188{,}50$ cm²`, 2],
        ['Leia telglõike tipunurk.', 2, '73,74', r`$\sin\frac\varphi2=\frac{6}{10}$, $\frac\varphi2\approx36{,}87^\circ$, $\varphi\approx73{,}74^\circ$.`, 3],
      ] },
      self: ['Kasutan õiget ruumala valemit.', 'Leian kõrguse või moodustaja Pythagorase teoreemiga.', 'Teisendan cm³ liitriteks.'],
    },
    {
      title: 'Tekstülesanded võrrandi ja süsteemiga',
      ru: 'Текстовые задачи: уравнение и система',
      course: 'I',
      exam: 'I osa, 10-punktiline ülesanne: koosta võrrand või võrrandisüsteem ja lahenda.',
      can: 'Õpilane tähistab tundmatu, koostab tekstist võrrandi või süsteemi, lahendab selle ja kontrollib vastust.',
      theory: [
        '1. Tähista tundmatu(d) ja kirjuta, mida täht tähendab.',
        '2. Koosta võrrand või võrrandisüsteem tekstist.',
        r`3. Lahenda: liitmisvõte või asendusvõte; ruutvõrrand valemiga.`,
        '4. Kontrolli vastust teksti järgi ja kirjuta vastuslause koos ühikuga.',
      ],
      ru_hint: [
        'Ключевые слова: «на … больше» — плюс, «в … раз» — умножить.',
        'Скорость = путь : время; работа: за 1 день делается 1/x часть работы.',
        'Отрицательный корень в задаче о скорости или времени не подходит.',
      ],
      example: {
        task: 'Kinopiletid: 2 täiskasvanut ja 3 last maksavad 31 €, 1 täiskasvanu ja 2 last 18 €. Kui palju maksab kumbki pilet?',
        steps: [r`$t$ — täiskasvanu pilet, $l$ — lapse pilet: $\begin{cases}2t+3l=31\\t+2l=18\end{cases}$`, r`$t=18-2l$; $36-4l+3l=31$, $l=5$, $t=8$.`, 'Täiskasvanu pilet maksab 8 €, lapse pilet 5 €.'],
      },
      practice: [
        { title: 'Kahe arvu summa on 52 ja vahe 14. Leia arvud.', parts: [
          ['', 2, '33; 19', r`$x+y=52$, $x-y=14$: $2x=66$, $x=33$, $y=19$.`],
        ] },
        { title: 'Rong läbib 240 km. Kui kiirus oleks 20 km/h suurem, jõuaks rong kohale 1 tunni võrra varem. Leia rongi kiirus.', parts: [
          ['', 4, '60', r`$\dfrac{240}{v}-\dfrac{240}{v+20}=1$, $4800=v^2+20v$, $v^2+20v-4800=0$, $v=60$ (negatiivne lahend ei sobi). Kiirus on 60 km/h.`, 6],
        ] },
        { title: '200 g 15% soolalahusele lisatakse vett, et saada 10% lahus. Mitu grammi vett lisatakse?', parts: [
          ['', 3, '100', r`Soola on $0{,}15\cdot200=30$ g; $\dfrac{30}{200+x}=0{,}1$, $200+x=300$, $x=100$ g.`, 4],
        ] },
        { title: 'Ristküliku pikkus on 3 cm suurem kui laius ja pindala on 70 cm².', parts: [
          ['Leia ristküliku laius ja pikkus.', 3, '7; 10', r`$x(x+3)=70$, $x^2+3x-70=0$, $x=7$ (teine lahend $-10$ ei sobi); pikkus 10 cm.`, 4],
          ['Leia ümbermõõt.', 1, '34', r`$2(7+10)=34$ cm`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Kaks töölist teevad töö koos 6 päevaga. Esimene tööline teeks üksi töö 5 päeva kiiremini kui teine.', parts: [
        ['Tähista tundmatu ja koosta võrrand.', 4, '', r`$x$ — esimese töölise päevad, $x+5$ — teise omad: $\dfrac1x+\dfrac1{x+5}=\dfrac16$.`, 4],
        ['Mitme päevaga teeks kumbki tööline töö üksi?', 6, '10; 15', r`$6(x+5)+6x=x(x+5)$, $x^2-7x-30=0$, $x=10$ ($x=-3$ ei sobi). Esimene 10 päevaga, teine 15 päevaga.`, 6],
      ] },
      self: ['Tähistan tundmatu ja kirjutan, mida see tähendab.', 'Koostan võrrandi või süsteemi.', 'Kontrollin vastust ja kirjutan vastuslause.'],
    },
  ],
};
