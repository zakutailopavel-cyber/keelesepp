// Matemaatika lai riigieksam (12. klass), owner 2026-11-16: the broad-track counterpart of kitsas12.js. One lesson per
// recurring lai exam task type (docs/MATH_RIIGIEKSAM_LAI.md); every task is our own (Harno past papers and the 2026
// marking scheme are a format and topic reference only). Estonian with short Russian hints.
// A lesson: theory (each formula marked: *valemilehel* = on the lai valemileht, *pähe* = to memorise), a worked example
// (with a graph or a geometry figure), practice tasks with answers and step-by-step solutions, one task in the exam's own
// form and points. `slots` are the exam task numbers (1–12, the 2027 spec) the lesson trains: tasks 1–4 are 5 p, tasks
// 5–12 are 10 p, so the exam task of a lesson carries 5 p only when all its slots are 1–4 (lai12.test.js checks it).
// Text is Markdown + $…$ formulas (KaTeX, engine/math.jsx); r`…` keeps the backslashes of LaTeX.
// A part: [text, points, answer, solution, rows?] — answer '' means the teacher judges it (a drawing, an explanation);
// several right forms are separated by |, several answers by ; (engine/mathExpr.js sameMathAnswer).
// `figure` is a „Geomeetriline joonis” (geofigure) block: the exam-style triangle or solid.

import { LAI_12_MOCKS } from './lai12mocks.js';

const r = String.raw;

export const LAI_12 = {
  id: 'ml12',
  title: 'Matemaatika lai: riigieksamiks',
  // the library level (Õppevara → Matemaatika, libraryModel.subjectOfLevel); the sheet's level box shows the short one
  level: '12. klass matemaatika lai',
  sheetLevel: 'Lai',
  minutes: 90,
  goal: 'Õpilane lahendab laia matemaatika riigieksami kõiki ülesandetüüpe ja kirjutab lahenduse samm-sammult.',
  // the teacher's plan (mathCurriculum.js): the track and what the lai formula sheet holds
  track: 'lai',
  formulaSheetRu: 'лист формул lai (на нём тригонометрия, формулы приведения, таблица производных и таблица интегралов)',
  // the mock exams' rules line (math/sheets.js) names the lai sheet
  formulaSheet: 'laia kursuse valemileht (trigonomeetria, tuletiste ja integraalide tabel)',
  // three full mock exams after the topic lessons (ml12-021…023, lai12mocks.js)
  mocks: LAI_12_MOCKS,
  lessons: [
    {
      title: 'Astmed, juured ja avaldised',
      ru: 'Степени, корни и выражения',
      course: 'I',
      slots: [3],
      exam: 'I osa, 5-punktiline ülesanne: lihtsusta ratsionaal- või irratsionaalavaldis ja arvuta väärtus.',
      can: 'Õpilane teeb tehteid astmete ja juurtega, tegurdab ja lihtsustab ratsionaal- ja irratsionaalavaldisi.',
      theory: [
        r`$a^m\cdot a^n=a^{m+n}$, $\;a^m:a^n=a^{m-n}$, $\;(a^m)^n=a^{mn}$, $\;a^{-n}=\dfrac1{a^n}$ — *pähe*`,
        r`$a^{\frac mn}=\sqrt[n]{a^m}$, $\;\sqrt[n]{a}\cdot\sqrt[n]{b}=\sqrt[n]{ab}$ — *pähe*`,
        r`$(a\pm b)^2=a^2\pm2ab+b^2$, $\;a^2-b^2=(a-b)(a+b)$, $\;a^3\pm b^3=(a\pm b)(a^2\mp ab+b^2)$ — *pähe*`,
        r`Irratsionaalsus nimetajast: $\dfrac{1}{\sqrt a-\sqrt b}=\dfrac{\sqrt a+\sqrt b}{a-b}$ — *pähe*`,
        r`Ruutkolmliige: $ax^2+bx+c=a(x-x_1)(x-x_2)$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул lai нет ни одной формулы этой темы — степени, корни и формулы сокращённого умножения учим наизусть.',
        'x − 4 = (√x − 2)(√x + 2), a√a − 8 = (√a)³ − 2³ — разность кубов.',
        'Сокращаем только множители. В ответе укажи, при каких значениях выражение не определено.',
      ],
      example: {
        task: r`Lihtsusta $\dfrac{a-4}{\sqrt a-2}-\sqrt a$, kui $a\ge0$, $a\ne4$.`,
        steps: [
          r`$a-4=(\sqrt a)^2-2^2=(\sqrt a-2)(\sqrt a+2)$.`,
          r`$\dfrac{(\sqrt a-2)(\sqrt a+2)}{\sqrt a-2}-\sqrt a=\sqrt a+2-\sqrt a$.`,
          r`Vastus: $2$.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$16^{0{,}75}$`, 1, '8', r`$16^{\frac34}=\left(\sqrt[4]{16}\right)^3=2^3=8$`],
          [r`$\left(\dfrac{8}{27}\right)^{-\frac23}$`, 1, '9/4|2,25', r`$\left(\dfrac{27}{8}\right)^{\frac23}=\left(\dfrac32\right)^2=\dfrac94=2{,}25$`],
          [r`$\sqrt[3]{54}:\sqrt[3]{2}$`, 1, '3', r`$\sqrt[3]{54:2}=\sqrt[3]{27}=3$`],
          [r`$\sqrt{12}+\sqrt{27}-\sqrt{48}$`, 1, '√3|1,73', r`$2\sqrt3+3\sqrt3-4\sqrt3=\sqrt3\approx1{,}73$`],
        ] },
        { title: 'Vabasta nimetaja irratsionaalsusest.', parts: [
          [r`$\dfrac{6}{\sqrt3}$`, 1, '2√3|3,46', r`$\dfrac{6\sqrt3}{3}=2\sqrt3\approx3{,}46$`],
          [r`$\dfrac{4}{\sqrt5-1}$`, 2, '√5+1|1+√5|3,24', r`$\dfrac{4(\sqrt5+1)}{(\sqrt5-1)(\sqrt5+1)}=\dfrac{4(\sqrt5+1)}{4}=\sqrt5+1\approx3{,}24$`, 4],
        ] },
        { title: 'Tegurda.', parts: [
          [r`$x^3-8$`, 1, '(x-2)(x^2+2x+4)|(x-2)(x²+2x+4)', r`Kuupide vahe: $x^3-2^3=(x-2)(x^2+2x+4)$.`],
          [r`$2x^2-x-6$`, 2, '(x-2)(2x+3)|(2x+3)(x-2)', r`$2x^2-x-6=0$: $D=1+48=49$, $x=\dfrac{1\pm7}{4}$, $x_1=2$, $x_2=-1{,}5$. Seega $2(x-2)(x+1{,}5)=(x-2)(2x+3)$.`, 4],
        ] },
        { title: 'Lihtsusta avaldis.', parts: [
          [r`$\left(\dfrac{1}{x-2}-\dfrac{4}{x^2-4}\right):\dfrac{1}{x+2}$`, 3, '1',
            r`Ühine nimetaja $(x-2)(x+2)$: $\dfrac{x+2-4}{(x-2)(x+2)}=\dfrac{x-2}{(x-2)(x+2)}=\dfrac1{x+2}$. Jagades $\dfrac1{x+2}$-ga saame $1$ ($x\ne\pm2$).`, 6],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (5 punkti)', context: r`Antud on avaldised $A=\dfrac{a\sqrt a-8}{a-4}$ ja $B=\dfrac{a+2\sqrt a+4}{\sqrt a+2}$, kus $a\ge0$ ja $a\ne4$.`, parts: [
        [r`Näita, et $A=B$.`, 3, '', r`$a\sqrt a-8=(\sqrt a)^3-2^3=(\sqrt a-2)(a+2\sqrt a+4)$ ja $a-4=(\sqrt a-2)(\sqrt a+2)$. Taandades $(\sqrt a-2)$: $A=\dfrac{a+2\sqrt a+4}{\sqrt a+2}=B$.`, 6],
        [r`Arvuta $A$ väärtus, kui $a=16$.`, 2, '14/3|4,67', r`$\sqrt{16}=4$: $A=\dfrac{16+8+4}{4+2}=\dfrac{28}{6}=\dfrac{14}{3}\approx4{,}67$.`, 3],
      ] },
      self: ['Kasutan astmete ja juurte reegleid.', 'Tegurdan kuupide vahe ja ruutkolmliikme.', 'Vabastan nimetaja irratsionaalsusest.'],
    },
    {
      title: 'Tekstülesanded võrrandisüsteemiga',
      ru: 'Текстовые задачи и системы уравнений',
      course: 'II, XIV',
      slots: [2],
      exam: 'I osa, 5-punktiline ülesanne: koosta tekstist võrrand või võrrandisüsteem, lahenda ja kirjuta sisuline vastus.',
      can: 'Õpilane koostab tekstist kuni kolme tundmatuga võrrandisüsteemi, lahendab selle ja kirjutab sisulise vastuse.',
      theory: [
        r`Liitmisvõte: korruta võrrandeid nii, et ühe tundmatu kordajad oleksid vastandarvud, ja liida — *pähe*`,
        r`Kolme tundmatuga süsteem: kõrvalda kahest võrrandipaarist sama tundmatu, saad kahe tundmatuga süsteemi — *pähe*`,
        r`$|x|=a\;(a\ge0)\;\Leftrightarrow\;x=a$ või $x=-a$; $\;|f(x)|=g(x)$ korral kontrolli, et $g(x)\ge0$ — *pähe*`,
        r`Tõus $p\%$: korruta $\left(1+\frac{p}{100}\right)$-ga; langus $p\%$: korruta $\left(1-\frac{p}{100}\right)$-ga — *pähe*`,
      ],
      ru_hint: [
        'Сначала напиши, что означает каждая буква (x — число учеников и т. п.): за это дают балл.',
        'Ответ — полным предложением с единицами: «В классе 24 ученика, аренда стоит 400 €».',
        'На листе формул этой темы нет.',
      ],
      example: {
        task: r`Lahenda süsteem $\begin{cases}x+y+z=6\\2x-y+z=3\\x+2y-z=2\end{cases}$`,
        steps: [
          r`I + III: $2x+3y=8$. II + III: $3x+y=5$, seega $y=5-3x$.`,
          r`$2x+3(5-3x)=8$, $-7x=-7$, $x=1$, $y=2$.`,
          r`I võrrandist $z=6-1-2=3$. Kontroll II: $2-2+3=3$ ✓. Vastus: $(1;2;3)$.`,
        ],
      },
      practice: [
        { title: 'Lahenda võrrand.', parts: [
          [r`$|2x-3|=5$`, 2, '4; -1', r`$2x-3=5$ annab $x=4$; $2x-3=-5$ annab $x=-1$.`],
          [r`$|x+1|=2x-4$`, 2, '5', r`Peab olema $2x-4\ge0$, st $x\ge2$. $x+1=2x-4$ annab $x=5$ ✓; $x+1=-(2x-4)$ annab $x=1$ — ei sobi ($x<2$).`, 4],
        ] },
        { title: 'Lahenda süsteem.', parts: [
          [r`$\begin{cases}x+y+z=9\\x-y+2z=7\\3x+y-z=5\end{cases}$`, 3, '(2;3;4)', r`I + III: $4x+2y=14$, st $2x+y=7$. II + 2·III: $7x+y=17$. Lahutades: $5x=10$, $x=2$, $y=3$, $z=9-2-3=4$.`, 6],
        ] },
        { title: 'Lahenda süsteem.', parts: [
          [r`$\begin{cases}x+y=7\\xy=12\end{cases}$`, 3, '(3;4); (4;3)', r`$y=7-x$: $x(7-x)=12$, $x^2-7x+12=0$, $x=3$ või $x=4$. Lahendid $(3;4)$ ja $(4;3)$.`, 5],
        ] },
        { title: 'Kohvik müüs ühel päeval 120 tassi kohvi ja teed kokku 310 euro eest. Kohvitass maksab 3 € ja teetass 2 €.', parts: [
          ['Mitu tassi kohvi ja mitu tassi teed müüdi?', 3, '70; 50', r`$x$ — kohvitassid, $y$ — teetassid: $x+y=120$, $3x+2y=310$. $3x+2(120-x)=310$, $x=70$, $y=50$. Müüdi 70 tassi kohvi ja 50 tassi teed.`, 5],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (5 punkti)', context: 'Klass kogub raha bussiekskursiooniks. Kui iga õpilane maksaks 15 €, jääks bussi rendist puudu 40 €. Kui iga õpilane maksaks 18 €, jääks üle 32 €.', parts: [
        ['Tähista tundmatud ja koosta võrrandisüsteem.', 2, '', r`$n$ — õpilaste arv, $R$ — bussi rent (€): $\begin{cases}15n+40=R\\18n-32=R\end{cases}$`, 4],
        ['Mitu õpilast on klassis?', 2, '24', r`$15n+40=18n-32$, $3n=72$, $n=24$.`, 3],
        ['Kui palju maksab bussi rent?', 1, '400', r`$R=15\cdot24+40=400$ €. Vastus: klassis on 24 õpilast, rent maksab 400 €.`, 2],
      ] },
      self: ['Kirjutan, mida iga täht tähendab.', 'Lahendan kolme tundmatuga süsteemi.', 'Kirjutan sisulise vastuse koos ühikuga.'],
    },
    {
      title: 'Võrratused ja võrratusesüsteemid',
      ru: 'Неравенства и системы неравенств',
      course: 'III',
      slots: [4],
      exam: 'I osa, 5-punktiline ülesanne: ruut- või murdvõrratus, sageli geomeetrilise või elulise lisatingimusega.',
      can: 'Õpilane lahendab ruut- ja murdvõrratusi ning võrratusesüsteeme ja arvestab ülesande lisatingimusi.',
      theory: [
        r`Ruutvõrratus: nullkohad, parabooli harud ($a>0$ üles), sobiv vahemik — *pähe*`,
        r`Murdvõrratus: vii kõik ühele poole, $\dfrac{f(x)}{g(x)}\ge0$, intervallmeetod; nimetajaga **ei korruta** — *pähe*`,
        r`Negatiivse arvuga korrutamisel või jagamisel võrratuse märk pöördub — *pähe*`,
        r`Võrratusesüsteem: lahendihulkade ühisosa arvteljel — *pähe*`,
      ],
      ru_hint: [
        'Дробное неравенство: перенеси всё в одну часть и приведи к общему знаменателю, потом метод интервалов.',
        'Знаменатель никогда не равен нулю — эта точка всегда «выколота».',
        'В задачах с длинами сторон добавь условие: стороны положительны. На листе формул этой темы нет.',
      ],
      example: {
        task: r`Lahenda võrratus $\dfrac{x+3}{x-1}\ge2$.`,
        steps: [
          r`$\dfrac{x+3}{x-1}-2\ge0$, $\;\dfrac{x+3-2x+2}{x-1}\ge0$, $\;\dfrac{5-x}{x-1}\ge0$.`,
          r`Nullkohad: lugeja $x=5$ (kuulub), nimetaja $x=1$ (ei kuulu).`,
          r`Intervallmeetod: murd on positiivne vahemikus $(1;5)$. Vastus: $1<x\le5$.`,
        ],
        graph: { fns: 'y = (x + 3)/(x - 1)\ny = 2', xmin: -3, xmax: 8, ymin: -4, ymax: 8, step: 1, stepY: 2, points: 'P(5; 2)', caption: 'tumesinine: y = (x + 3)/(x − 1) · roheline: y = 2' },
      },
      practice: [
        { title: 'Lahenda ruutvõrratus.', parts: [
          [r`$x^2-5x+4\le0$`, 2, '1<=x<=4|1≤x≤4|[1;4]', r`Nullkohad $1$ ja $4$, harud üleval: $1\le x\le4$.`],
          [r`$-x^2+2x+8<0$`, 2, 'x<-2 või x>4|(-∞;-2)∪(4;∞)', r`Korruta $-1$-ga, märk pöördub: $x^2-2x-8>0$, nullkohad $-2$ ja $4$: $x<-2$ või $x>4$.`],
        ] },
        { title: 'Lahenda murdvõrratus.', parts: [
          [r`$\dfrac{2x-1}{x+2}<1$`, 3, '-2<x<3|(-2;3)', r`$\dfrac{2x-1-x-2}{x+2}<0$, $\dfrac{x-3}{x+2}<0$. Murd on negatiivne nullkohtade $-2$ ja $3$ vahel: $-2<x<3$.`, 5],
        ] },
        { title: r`Lahenda võrratusesüsteem $\begin{cases}3x-2>x+4\\x^2\le25\end{cases}$`, parts: [
          ['Leia lahendihulk.', 2, '3<x<=5|3<x≤5|(3;5]', r`$2x>6$, $x>3$; $x^2\le25$ annab $-5\le x\le5$. Ühisosa: $3<x\le5$.`, 4],
          ['Kirjuta süsteemi täisarvulised lahendid.', 1, '4; 5', r`$4$ ja $5$.`, 1],
        ] },
        { title: r`Millise $m$ korral ei ole võrrandil $x^2+mx+9=0$ reaalarvulisi lahendeid?`, parts: [
          ['', 3, '-6<m<6|(-6;6)', r`Lahendeid ei ole, kui $D<0$: $m^2-36<0$, $(m-6)(m+6)<0$, $-6<m<6$.`, 4],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (5 punkti)', context: r`Ristküliku lähisküljed on $(x+2)$ cm ja $(2x-1)$ cm. Leia kõik $x$ väärtused, mille korral ristküliku pindala on väiksem kui $25$ cm².`, parts: [
        ['Koosta võrratus.', 1, '', r`$(x+2)(2x-1)<25$`, 2],
        ['Lahenda võrratus.', 2, '-4,5<x<3|(-4,5;3)', r`$2x^2+3x-2<25$, $2x^2+3x-27<0$. $D=9+216=225$, $x=\dfrac{-3\pm15}{4}$: $x_1=3$, $x_2=-4{,}5$. Harud üleval: $-4{,}5<x<3$.`, 5],
        ['Arvesta, et küljed on positiivsed, ja kirjuta vastus.', 2, '0,5<x<3|(0,5;3)', r`$x+2>0$ ja $2x-1>0$ annavad $x>0{,}5$. Ühisosa: $0{,}5<x<3$.`, 3],
      ] },
      self: ['Lahendan ruutvõrratuse parabooli abil.', 'Lahendan murdvõrratuse intervallmeetodiga.', 'Arvestan ülesande lisatingimust.'],
    },
    {
      title: 'Kombinatoorika ja tõenäosus',
      ru: 'Комбинаторика и вероятность',
      course: 'VI',
      slots: [1],
      exam: 'I osa, 5-punktiline ülesanne: tõenäosus kombinatsioonidega, sündmuste summa ja korrutis.',
      can: 'Õpilane leiab permutatsioonide, variatsioonide ja kombinatsioonide arvu ning arvutab sündmuste tõenäosusi.',
      theory: [
        r`Klassikaline tõenäosus $P(A)=\dfrac{k}{n}$; vastandsündmus $P(\bar A)=1-P(A)$ — *pähe*`,
        r`$P_n=n!$, $\;A_n^k=\dfrac{n!}{(n-k)!}$, $\;C_n^k=\dfrac{n!}{k!\,(n-k)!}$ — *pähe*`,
        r`Sõltumatud sündmused: $P(AB)=P(A)\cdot P(B)$ — *pähe*`,
        r`Summa: $P(A+B)=P(A)+P(B)-P(AB)$; välistavate korral $P(A+B)=P(A)+P(B)$ — *pähe*`,
      ],
      ru_hint: [
        'Порядок важен → размещения A; порядок не важен (выбираем группу) → сочетания C.',
        '«Хотя бы один» удобнее считать через противоположное событие: 1 − P(ни одного).',
        'На листе формул комбинаторики нет — формулы учим наизусть.',
      ],
      example: {
        task: 'Klassis on 12 poissi ja 8 tüdrukut. Juhuslikult valitakse 3 õpilast. Leia tõenäosus, et kõik valitud on tüdrukud.',
        steps: [
          r`Kõik valikud: $C_{20}^3=\dfrac{20\cdot19\cdot18}{3!}=1140$.`,
          r`Soodsad: $C_8^3=\dfrac{8\cdot7\cdot6}{3!}=56$.`,
          r`$P=\dfrac{56}{1140}=\dfrac{14}{285}\approx0{,}049$.`,
        ],
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$5!$`, 1, '120', r`$5\cdot4\cdot3\cdot2\cdot1=120$`],
          [r`$A_7^3$`, 1, '210', r`$7\cdot6\cdot5=210$`],
          [r`$C_{10}^4$`, 1, '210', r`$\dfrac{10\cdot9\cdot8\cdot7}{4!}=\dfrac{5040}{24}=210$`],
          ['Mitmel viisil saab 6 erinevat raamatut riiulile ritta panna?', 1, '720', r`$P_6=6!=720$`],
        ] },
        { title: 'Täringut visatakse kaks korda.', parts: [
          ['Leia tõenäosus, et silmade summa on 8.', 2, '5/36|0,139', r`Soodsad: $(2;6),(3;5),(4;4),(5;3),(6;2)$ — 5 võimalust 36-st: $P=\dfrac5{36}\approx0{,}139$.`],
          ['Leia tõenäosus, et vähemalt ühel viskel tuleb kuus.', 2, '11/36|0,306', r`Vastandsündmus „kumbki pole kuus”: $\left(\frac56\right)^2=\frac{25}{36}$. $P=1-\frac{25}{36}=\frac{11}{36}\approx0{,}306$.`],
        ] },
        { title: 'Laskur tabab märki tõenäosusega 0,8. Ta laseb kolm korda, lasud on sõltumatud.', parts: [
          ['Leia tõenäosus, et kõik kolm lasku tabavad.', 1, '0,512', r`$0{,}8^3=0{,}512$`],
          ['Leia tõenäosus, et vähemalt üks lask tabab.', 1, '0,992', r`$1-0{,}2^3=1-0{,}008=0{,}992$`],
          ['Leia tõenäosus, et täpselt kaks lasku tabavad.', 2, '0,384', r`Möödalask võib olla ükskõik milline kolmest: $3\cdot0{,}8^2\cdot0{,}2=0{,}384$.`],
        ] },
        { title: 'Urnis on 4 punast ja 6 valget kuuli. Juhuslikult võetakse 3 kuuli.', parts: [
          ['Leia tõenäosus, et täpselt kaks võetud kuuli on punased.', 3, '0,3|3/10', r`$P=\dfrac{C_4^2\cdot C_6^1}{C_{10}^3}=\dfrac{6\cdot6}{120}=0{,}3$`, 4],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (5 punkti)', context: 'Karbis on 6 rohelist ja 4 kollast pliiatsit. Karbist võetakse juhuslikult 4 pliiatsit.', parts: [
        ['Leia tõenäosus, et kõik võetud pliiatsid on rohelised.', 2, '1/14|0,071', r`$P=\dfrac{C_6^4}{C_{10}^4}=\dfrac{15}{210}=\dfrac1{14}\approx0{,}071$`, 4],
        ['Leia tõenäosus, et vähemalt kolm võetud pliiatsit on kollased.', 3, '5/42|0,119', r`3 kollast ja 1 roheline või 4 kollast (välistavad): $P=\dfrac{C_4^3C_6^1+C_4^4}{C_{10}^4}=\dfrac{24+1}{210}=\dfrac{5}{42}\approx0{,}119$`, 5],
      ] },
      self: ['Eristan variatsiooni ja kombinatsiooni.', 'Kasutan vastandsündmust.', 'Liidan välistavate sündmuste tõenäosused.'],
    },
    {
      title: 'Juhuslik suurus, binoom- ja normaaljaotus',
      ru: 'Случайная величина, биномиальное и нормальное распределение',
      course: 'VI',
      slots: [1],
      exam: 'I osa, 5-punktiline tõenäosusülesanne: jaotustabel, keskväärtus, binoomjaotus, normaaljaotuse reegel.',
      can: 'Õpilane koostab jaotustabeli, arvutab keskväärtuse ja standardhälbe ning kasutab binoom- ja normaaljaotust.',
      theory: [
        r`$E(X)=\sum x_ip_i$, $\;D(X)=\sum x_i^2p_i-\big(E(X)\big)^2$, $\;\sigma=\sqrt{D(X)}$; $\;\sum p_i=1$ — *pähe*`,
        r`Binoomjaotus: $P(X=k)=C_n^k\,p^k(1-p)^{n-k}$, $\;E(X)=np$, $\;\sigma=\sqrt{np(1-p)}$ — *pähe*`,
        r`Normaaljaotus $N(\mu;\sigma)$: vahemikus $\mu\pm\sigma$ on $\approx68\%$, $\mu\pm2\sigma$ — $\approx95\%$, $\mu\pm3\sigma$ — $\approx99{,}7\%$ väärtustest — *pähe*`,
      ],
      ru_hint: [
        'Сумма всех вероятностей в таблице распределения равна 1 — так находят неизвестную вероятность.',
        'Биномиальное распределение: n независимых повторений, в каждом успех с вероятностью p.',
        'Нормальное распределение: правило 68–95–99,7 %. На листе формул этой темы нет.',
      ],
      example: {
        task: r`Münti visatakse 4 korda. $X$ — kullide arv. Leia $P(X=2)$ ja $E(X)$.`,
        steps: [
          r`Binoomjaotus, $n=4$, $p=0{,}5$.`,
          r`$P(X=2)=C_4^2\cdot0{,}5^2\cdot0{,}5^2=\dfrac{6}{16}=0{,}375$.`,
          r`$E(X)=np=4\cdot0{,}5=2$.`,
        ],
      },
      practice: [
        { title: r`Juhusliku suuruse $X$ jaotustabel: $x$: 0, 1, 2, 3; $\;p$: 0,1; 0,3; 0,4; $p$.`, parts: [
          [r`Leia $p$.`, 1, '0,2', r`$p=1-0{,}1-0{,}3-0{,}4=0{,}2$`],
          [r`Leia keskväärtus $E(X)$.`, 1, '1,7', r`$0\cdot0{,}1+1\cdot0{,}3+2\cdot0{,}4+3\cdot0{,}2=1{,}7$`],
          [r`Leia standardhälve $\sigma$.`, 2, '0,9', r`$\sum x_i^2p_i=0{,}3+1{,}6+1{,}8=3{,}7$; $D=3{,}7-1{,}7^2=0{,}81$; $\sigma=0{,}9$.`, 4],
        ] },
        { title: 'Testis on 5 küsimust, igal 4 vastusevarianti, millest üks on õige. Õpilane arvab kõik vastused juhuslikult.', parts: [
          ['Leia tõenäosus, et ükski vastus pole õige.', 1, '0,237|0,24', r`$0{,}75^5\approx0{,}237$`],
          ['Leia tõenäosus, et täpselt kaks vastust on õiged.', 2, '0,264|0,26', r`$C_5^2\cdot0{,}25^2\cdot0{,}75^3=10\cdot0{,}0625\cdot0{,}421875\approx0{,}264$`],
          ['Leia õigete vastuste arvu keskväärtus.', 1, '1,25', r`$np=5\cdot0{,}25=1{,}25$`],
        ] },
        { title: 'Õunte mass on normaaljaotusega, keskväärtus 180 g ja standardhälve 15 g.', parts: [
          ['Mitu protsenti õuntest kaalub 165–195 g?', 1, '68', r`$180\pm15$ on $\mu\pm\sigma$: umbes $68\%$.`],
          ['Mitu protsenti õuntest kaalub 150–210 g?', 1, '95', r`$\mu\pm2\sigma$: umbes $95\%$.`],
          ['Kui suur on tõenäosus, et õun kaalub üle 210 g?', 2, '0,025', r`Väljaspool $\mu\pm2\sigma$ on $5\%$, sellest pool on ülal: $0{,}025$.`],
        ] },
        { title: 'Mängus maksad 2 € ja viskad täringut. Kuue korral saad 9 €, muidu mitte midagi.', parts: [
          [r`Leia kasumi $X$ keskväärtus.`, 2, '-0,5', r`$X=7$ tõenäosusega $\frac16$, $X=-2$ tõenäosusega $\frac56$: $E(X)=\dfrac{7-10}{6}=-0{,}5$ €.`],
          ['Kas mäng on mängijale kasulik? Põhjenda.', 1, '', r`Ei ole: keskmiselt kaotab mängija igas mängus 0,5 €.`, 2],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (5 punkti)', context: 'Tehase toodetest on 5% defektsed. Kontrolliks võetakse juhuslikult 20 toodet (valikud on sõltumatud).', parts: [
        ['Leia defektsete toodete arvu keskväärtus ja standardhälve.', 2, '1; 0,97|1; 0,975', r`Binoomjaotus $n=20$, $p=0{,}05$: $E(X)=20\cdot0{,}05=1$, $\sigma=\sqrt{20\cdot0{,}05\cdot0{,}95}=\sqrt{0{,}95}\approx0{,}97$.`, 3],
        ['Leia tõenäosus, et ükski kontrollitud toode pole defektne.', 1, '0,358|0,36', r`$P(X=0)=0{,}95^{20}\approx0{,}358$`, 2],
        ['Leia tõenäosus, et defektseid tooteid on vähemalt kaks.', 2, '0,264|0,26', r`$P(X=1)=20\cdot0{,}05\cdot0{,}95^{19}\approx0{,}377$. $P(X\ge2)=1-P(X=0)-P(X=1)\approx1-0{,}358-0{,}377=0{,}264$.`, 4],
      ] },
      self: ['Arvutan keskväärtuse ja standardhälbe.', 'Kasutan binoomjaotuse valemit.', 'Kasutan normaaljaotuse 68–95–99,7 reeglit.'],
    },
    {
      title: 'Statistika ja korrelatsioon',
      ru: 'Статистика и корреляция',
      course: 'VI',
      slots: [1],
      exam: 'I osa, 5-punktiline ülesanne: keskmine, mediaan, standardhälve, korrelatsioon või usalduspiirkond.',
      can: 'Õpilane arvutab andmete arvkarakteristikud, tõlgendab korrelatsioonikordajat ja leiab keskmise usalduspiirkonna.',
      theory: [
        r`$\bar x=\dfrac{\sum x_i}{n}$ (sagedustega $\dfrac{\sum f_ix_i}{\sum f_i}$); mood — kõige sagedasem; mediaan — keskmine järjestatud reas — *pähe*`,
        r`$\sigma=\sqrt{\dfrac{\sum(x_i-\bar x)^2}{n}}$ — *pähe*`,
        r`Korrelatsioonikordaja $-1\le r\le1$: $|r|$ lähedal 1-le — tugev seos, märk näitab suunda, $r\approx0$ — lineaarset seost pole — *pähe*`,
        r`Keskmise 95% usalduspiirkond: $\bar x-1{,}96\dfrac{\sigma}{\sqrt n}<\mu<\bar x+1{,}96\dfrac{\sigma}{\sqrt n}$ — *pähe*`,
      ],
      ru_hint: [
        'Медиана: упорядочь данные; при чётном n — среднее двух средних чисел.',
        'Стандартное отклонение показывает разброс: чем меньше σ, тем однороднее результаты.',
        'На листе формул статистики нет.',
      ],
      example: {
        task: 'Andmed: 4, 6, 7, 7, 11. Leia keskmine, mood, mediaan ja standardhälve.',
        steps: [
          r`$\bar x=\dfrac{35}{5}=7$; mood $7$; mediaan $7$.`,
          r`Hälbed: $-3,-1,0,0,4$; ruutude summa $9+1+0+0+16=26$.`,
          r`$\sigma=\sqrt{\dfrac{26}{5}}=\sqrt{5{,}2}\approx2{,}28$.`,
        ],
      },
      practice: [
        { title: 'Andmed: 3, 5, 5, 6, 8, 9.', parts: [
          ['Aritmeetiline keskmine', 1, '6', r`$\dfrac{36}{6}=6$`],
          ['Mediaan', 1, '5,5', r`$\dfrac{5+6}{2}=5{,}5$`],
          ['Mood', 1, '5', 'Kõige sagedasem on 5.'],
          ['Standardhälve', 2, '2', r`Hälbed $-3,-1,-1,0,2,3$; ruudud kokku $24$; $\sigma=\sqrt{24:6}=2$.`],
        ] },
        { title: 'Kontrolltöö hinded: „2” — 2 õpilast, „3” — 5, „4” — 8, „5” — 5.', parts: [
          ['Keskmine hinne', 1, '3,8', r`$\dfrac{2\cdot2+3\cdot5+4\cdot8+5\cdot5}{20}=\dfrac{76}{20}=3{,}8$`],
          ['Mediaan', 1, '4', r`20 õpilast: 10. ja 11. hinne on mõlemad „4”.`],
          ['Standardhälve', 2, '0,93', r`$\dfrac{2\cdot1{,}8^2+5\cdot0{,}8^2+8\cdot0{,}2^2+5\cdot1{,}2^2}{20}=\dfrac{17{,}2}{20}=0{,}86$; $\sigma=\sqrt{0{,}86}\approx0{,}93$.`],
        ] },
        { title: r`Vali igale seosele sobiv korrelatsioonikordaja: $r=0{,}9$; $\;r=-0{,}85$; $\;r=0{,}05$.`, parts: [
          ['Treeningtundide arv nädalas ja 100 m jooksu aeg', 1, '-0,85', 'Mida rohkem treeningut, seda väiksem aeg: tugev negatiivne seos.'],
          ['Jalanumber ja matemaatika hinne', 1, '0,05', 'Seost ei ole.'],
          ['Inimese pikkus ja kehakaal', 1, '0,9', 'Tugev positiivne seos.'],
        ] },
        { title: '100 õpilase valimis on keskmine pikkus 172 cm ja standardhälve 10 cm.', parts: [
          ['Leia keskmise pikkuse 95% usalduspiirkond.', 2, '170,04; 173,96', r`$1{,}96\cdot\dfrac{10}{\sqrt{100}}=1{,}96$: $172\pm1{,}96$, st $170{,}04<\mu<173{,}96$.`],
          ['Leia usalduspiirkond, kui valimis oleks 400 õpilast (sama keskmine ja hälve).', 1, '171,02; 172,98', r`$1{,}96\cdot\dfrac{10}{20}=0{,}98$: $171{,}02<\mu<172{,}98$ — suurem valim annab kitsama piirkonna.`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (5 punkti)', context: 'Rühma 8 õpilase testipunktid on 12, 15, 15, 17, 18, 20, 22, 25.', parts: [
        ['Leia aritmeetiline keskmine.', 1, '18', r`$\dfrac{144}{8}=18$`, 2],
        ['Leia mediaan.', 1, '17,5', r`$\dfrac{17+18}{2}=17{,}5$`, 1],
        ['Leia standardhälve.', 2, '3,94', r`Hälbed $-6,-3,-3,-1,0,2,4,7$; ruudud $36+9+9+1+0+4+16+49=124$; $\sigma=\sqrt{124:8}=\sqrt{15{,}5}\approx3{,}94$.`, 4],
        ['Teise rühma keskmine on samuti 18 punkti, standardhälve 6 punkti. Kumma rühma tulemused on ühtlasemad? Põhjenda.', 1, '', 'Esimese rühma, sest selle standardhälve (3,94) on väiksem kui 6.', 2],
      ] },
      self: ['Leian keskmise, mediaani ja moodi.', 'Arvutan standardhälbe.', 'Tõlgendan korrelatsioonikordajat ja usalduspiirkonda.'],
    },
    {
      title: 'Aritmeetiline ja geomeetriline jada',
      ru: 'Арифметическая и геометрическая прогрессия',
      course: 'VII',
      slots: [6],
      exam: 'I osa, 10-punktiline ülesanne: jada liikmed ja summa, kolm järjestikust liiget, eluline ülesanne.',
      can: 'Õpilane kasutab aritmeetilise ja geomeetrilise jada üldliikme ja summa valemeid ning lahendab jadadega tekstülesandeid.',
      theory: [
        r`Aritmeetiline: $a_n=a_1+(n-1)d$, $\;S_n=\dfrac{(a_1+a_n)n}{2}$ — *pähe*`,
        r`Geomeetriline: $a_n=a_1q^{n-1}$, $\;S_n=\dfrac{a_1(q^n-1)}{q-1}$ — *pähe*`,
        r`Kolm järjestikust liiget: aritmeetilises $2b=a+c$, geomeetrilises $b^2=ac$ — *pähe*`,
      ],
      ru_hint: [
        'Формул прогрессий на листе формул нет — учи наизусть.',
        'Два условия → система уравнений относительно a₁ и d (или a₁ и q).',
        'Проверь знак: если по условию числа положительные, отрицательный корень не подходит.',
      ],
      example: {
        task: r`Aritmeetilises jadas $a_3=7$ ja $a_8=22$. Leia $a_1$, $d$ ja $S_{10}$.`,
        steps: [
          r`$a_1+2d=7$, $a_1+7d=22$; lahutades $5d=15$, $d=3$, $a_1=1$.`,
          r`$a_{10}=1+9\cdot3=28$.`,
          r`$S_{10}=\dfrac{(1+28)\cdot10}{2}=145$.`,
        ],
      },
      practice: [
        { title: r`Aritmeetilises jadas $a_1=-4$ ja $d=2{,}5$.`, parts: [
          [r`Leia $a_{15}$.`, 1, '31', r`$-4+14\cdot2{,}5=31$`],
          [r`Leia $S_{15}$.`, 2, '202,5', r`$\dfrac{(-4+31)\cdot15}{2}=202{,}5$`],
        ] },
        { title: r`Geomeetrilises jadas $a_2=6$ ja $a_5=162$.`, parts: [
          [r`Leia tegur $q$.`, 1, '3', r`$\dfrac{a_5}{a_2}=q^3=27$, $q=3$`],
          [r`Leia $a_1$.`, 1, '2', r`$a_1=6:3=2$`],
          [r`Leia $S_6$.`, 1, '728', r`$\dfrac{2(3^6-1)}{3-1}=728$`],
        ] },
        { title: r`Arvud $x-1$, $x+3$ ja $3x+1$ on geomeetrilise jada järjestikused liikmed. Leia $x$.`, parts: [
          ['', 3, '5; -1', r`$(x+3)^2=(x-1)(3x+1)$, $x^2+6x+9=3x^2-2x-1$, $x^2-4x-5=0$, $x=5$ või $x=-1$. Kontroll: $4,8,16$ ($q=2$) ja $-2,2,-2$ ($q=-1$) — mõlemad sobivad.`, 5],
        ] },
        { title: 'Kolm arvu moodustavad aritmeetilise jada, nende summa on 15. Kui liita neile vastavalt 1, 1 ja 4, saadakse geomeetriline jada. Leia aritmeetilise jada vahe.', parts: [
          ['', 3, '3; -6', r`Arvud $5-d$, $5$, $5+d$ ($3\cdot5=15$). Geomeetriline: $6-d$, $6$, $9+d$: $36=(6-d)(9+d)$, $d^2+3d-18=0$, $d=3$ või $d=-6$ (jadad $2,5,8$ ja $11,5,-1$).`, 5],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Raamatukogu A sai 2027. aastal 1200 uut raamatut ja saab igal järgmisel aastal 80 raamatut rohkem kui eelmisel. Raamatukogu B sai 2027. aastal 1000 uut raamatut ja saab igal järgmisel aastal 6% rohkem kui eelmisel.', parts: [
        ['Mitu uut raamatut saab raamatukogu A aastal 2036?', 2, '1920', r`Aritmeetiline jada, $a_1=1200$, $d=80$, $n=10$: $a_{10}=1200+9\cdot80=1920$.`, 3],
        ['Mitu uut raamatut saab raamatukogu A kokku aastatel 2027–2036?', 2, '15600', r`$S_{10}=\dfrac{(1200+1920)\cdot10}{2}=15\,600$.`, 3],
        ['Mitu uut raamatut saab raamatukogu B aastal 2036?', 2, '1689|1689,48', r`Geomeetriline jada, $q=1{,}06$: $a_{10}=1000\cdot1{,}06^9\approx1689$.`, 3],
        ['Mitu uut raamatut saab raamatukogu B kokku aastatel 2027–2036?', 2, '13181|13180,8', r`$S_{10}=\dfrac{1000(1{,}06^{10}-1)}{0{,}06}\approx13\,181$.`, 3],
        ['Kumb raamatukogu sai kümne aastaga rohkem raamatuid ja kui palju?', 2, '2419|2419,2', r`Raamatukogu A: $15\,600-13\,181=2419$ raamatut rohkem.`, 2],
      ] },
      self: ['Kasutan üldliikme valemeid.', 'Kasutan summa valemeid.', 'Tunnen tekstist ära, kas jada on aritmeetiline või geomeetriline.'],
    },
    {
      title: 'Piirväärtus ja hääbuv geomeetriline jada',
      ru: 'Предел и бесконечно убывающая прогрессия',
      course: 'VII, IX',
      slots: [6],
      exam: 'I osa, 10-punktilise jadaülesande osa: hääbuva geomeetrilise jada summa, piirväärtus; tuletise mõiste alus.',
      can: 'Õpilane leiab jada ja funktsiooni piirväärtuse ning hääbuva geomeetrilise jada summa.',
      theory: [
        r`$\lim\limits_{n\to\infty}\dfrac1n=0$; murru korral jaga lugeja ja nimetaja $n$ kõrgeima astmega — *pähe*`,
        r`$\lim\limits_{x\to a}f(x)$: asenda $x=a$; kui tuleb $\frac00$, tegurda ja taanda — *pähe*`,
        r`Hääbuv geomeetriline jada ($|q|<1$): $S=\dfrac{a_1}{1-q}$ — *pähe*`,
        r`$\lim\limits_{n\to\infty}\left(1+\dfrac1n\right)^n=e\approx2{,}718$ — *pähe*`,
      ],
      ru_hint: [
        'Неопределённость 0/0: разложи на множители и сократи, потом подставь.',
        'Предел дроби при n → ∞ определяют старшие степени числителя и знаменателя.',
        'Сумма бесконечно убывающей прогрессии: S = a₁ / (1 − q), только если |q| < 1. На листе формул её нет.',
      ],
      example: {
        task: r`Leia $\lim\limits_{x\to2}\dfrac{x^2-4}{x-2}$.`,
        steps: [
          r`Asendades tuleb $\frac00$ — tegurda: $\dfrac{(x-2)(x+2)}{x-2}=x+2$, kui $x\ne2$.`,
          r`$\lim\limits_{x\to2}(x+2)=4$.`,
        ],
      },
      practice: [
        { title: 'Leia jada piirväärtus.', parts: [
          [r`$\lim\limits_{n\to\infty}\dfrac{3n+1}{n+2}$`, 1, '3', r`Jaga $n$-ga: $\dfrac{3+\frac1n}{1+\frac2n}\to3$`],
          [r`$\lim\limits_{n\to\infty}\dfrac{2n^2-n}{5n^2+3}$`, 1, '0,4|2/5', r`Jaga $n^2$-ga: $\to\dfrac25=0{,}4$`],
          [r`$\lim\limits_{n\to\infty}\dfrac{n+1}{n^2+1}$`, 1, '0', r`Jaga $n^2$-ga: $\dfrac{\frac1n+\frac1{n^2}}{1+\frac1{n^2}}\to0$`],
        ] },
        { title: 'Leia funktsiooni piirväärtus.', parts: [
          [r`$\lim\limits_{x\to3}\dfrac{x^2-9}{x-3}$`, 1, '6', r`$=\lim(x+3)=6$`],
          [r`$\lim\limits_{x\to1}\dfrac{x^2+2x-3}{x^2-1}$`, 2, '2', r`$\dfrac{(x+3)(x-1)}{(x-1)(x+1)}=\dfrac{x+3}{x+1}\to\dfrac42=2$`],
          [r`$\lim\limits_{x\to\infty}\dfrac{4x^3-x}{2x^3+5}$`, 1, '2', r`Kõrgeimate astmete kordajad: $\dfrac42=2$`],
          [r`$\lim\limits_{x\to4}\dfrac{\sqrt x-2}{x-4}$`, 2, '0,25|1/4', r`$x-4=(\sqrt x-2)(\sqrt x+2)$: $\dfrac1{\sqrt x+2}\to\dfrac14$`],
        ] },
        { title: 'Hääbuv geomeetriline jada.', parts: [
          [r`Leia summa $12+6+3+1{,}5+\ldots$`, 1, '24', r`$q=0{,}5$: $S=\dfrac{12}{1-0{,}5}=24$`],
          [r`Kirjuta perioodiline murd $0{,}(36)$ harilikuna.`, 2, '4/11', r`$0{,}36+0{,}0036+\ldots$: $S=\dfrac{0{,}36}{1-0{,}01}=\dfrac{36}{99}=\dfrac4{11}$`],
        ] },
        { title: r`Hääbuva geomeetrilise jada summa on 18 ja esimene liige 12. Leia tegur $q$.`, parts: [
          ['', 2, '1/3|0,33', r`$\dfrac{12}{1-q}=18$, $1-q=\dfrac23$, $q=\dfrac13$`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Pall kukub 4 m kõrguselt maha. Iga põrke järel tõuseb pall 60% eelmisest kõrgusest.', parts: [
        ['Kui kõrgele tõuseb pall pärast kolmandat põrget?', 2, '0,864', r`Kõrgused on geomeetriline jada $q=0{,}6$: $4\cdot0{,}6^3=0{,}864$ m.`, 3],
        ['Mitmenda põrke järel jääb tõusu kõrgus esimest korda alla 10 cm?', 3, '8', r`$4\cdot0{,}6^n<0{,}1$, $0{,}6^n<0{,}025$, $n>\dfrac{\ln0{,}025}{\ln0{,}6}\approx7{,}2$. Vastus: 8. põrke järel.`, 4],
        ['Mitu meetrit on pall läbinud hetkeks, mil ta kolmandat korda maad puudutab?', 2, '11,68', r`$4+2\cdot2{,}4+2\cdot1{,}44=11{,}68$ m (alla 4 m, siis kaks korda üles-alla).`, 3],
        ['Kui pikk oleks palli kogu teekond, kui ta põrkaks lõputult?', 3, '16', r`Tõusude summa on hääbuv jada: $\dfrac{2{,}4}{1-0{,}6}=6$ m. Teekond $4+2\cdot6=16$ m.`, 4],
      ] },
      self: ['Leian murru piirväärtuse.', 'Tegurdan, kui tuleb 0/0.', 'Kasutan hääbuva jada summa valemit.'],
    },
    {
      title: 'Trigonomeetrilised võrrandid radiaanides',
      ru: 'Тригонометрические уравнения в радианах',
      course: 'III, IV, IX',
      slots: [8],
      exam: 'II osa, 10-punktiline ülesanne: teisenda avaldis valemilehe valemitega ja lahenda trigonomeetriline võrrand antud lõigul.',
      can: 'Õpilane teisendab trigonomeetrilisi avaldisi valemilehe abil ja leiab võrrandi lahendid antud lõigul radiaanides.',
      theory: [
        r`$180^\circ=\pi$ rad; täpsed väärtused $0,\frac\pi6,\frac\pi4,\frac\pi3,\frac\pi2$ — *pähe*`,
        r`$\sin^2\alpha+\cos^2\alpha=1$, $\;\sin2\alpha=2\sin\alpha\cos\alpha$, $\;\cos2\alpha=\cos^2\alpha-\sin^2\alpha$, summa- ja vahevalemid, taandamisvalemid — *valemilehel*`,
        r`$\sin x=a$: $x=\arcsin a+2n\pi$ või $x=\pi-\arcsin a+2n\pi$ — *pähe*`,
        r`$\cos x=a$: $x=\pm\arccos a+2n\pi$; $\;\tan x=a$: $x=\arctan a+n\pi$ — *pähe*`,
      ],
      ru_hint: [
        'На листе формул есть основные тождества, двойной угол, формулы суммы и приведения — но НЕТ общих решений и точных значений.',
        'Не делим на sin x: выносим его за скобки, иначе потеряем корни.',
        'Ответ — только корни из данного отрезка; калькулятор в режиме RAD.',
      ],
      example: {
        task: r`Lahenda võrrand $2\sin^2x-\sin x=0$ lõigul $[0;2\pi]$.`,
        steps: [
          r`$\sin x\,(2\sin x-1)=0$.`,
          r`$\sin x=0$: $x=0$, $x=\pi$, $x=2\pi$.`,
          r`$\sin x=\frac12$: $x=\frac\pi6$, $x=\frac{5\pi}6$.`,
          r`Vastus: $0;\ \frac\pi6;\ \frac{5\pi}6;\ \pi;\ 2\pi$.`,
        ],
      },
      practice: [
        { title: 'Teisenda ja arvuta.', parts: [
          [r`Kirjuta $150^\circ$ radiaanides.`, 1, '5π/6|2,62', r`$150\cdot\dfrac{\pi}{180}=\dfrac{5\pi}6$`],
          [r`Kirjuta $\dfrac{7\pi}{4}$ kraadides.`, 1, '315', r`$\dfrac74\cdot180^\circ=315^\circ$`],
          [r`Arvuta $\sin\dfrac{2\pi}3\cdot\cos\dfrac\pi3$.`, 1, '√3/4|0,43', r`$\dfrac{\sqrt3}{2}\cdot\dfrac12=\dfrac{\sqrt3}4\approx0{,}43$`],
          [r`Lihtsusta $\dfrac{\sin2x}{2\cos x}$.`, 1, 'sinx|sin(x)', r`$\dfrac{2\sin x\cos x}{2\cos x}=\sin x$`],
        ] },
        { title: r`Lahenda võrrand lõigul $[0;2\pi]$.`, parts: [
          [r`$\cos x=-\dfrac12$`, 2, '2π/3; 4π/3|2,09; 4,19', r`$x=\pm\dfrac{2\pi}3+2n\pi$; lõigul: $\dfrac{2\pi}3$ ja $\dfrac{4\pi}3$.`],
          [r`$\tan x=\sqrt3$`, 1, 'π/3; 4π/3|1,05; 4,19', r`$x=\dfrac\pi3+n\pi$: $\dfrac\pi3$ ja $\dfrac{4\pi}3$.`],
          [r`$2\cos^2x+\cos x-1=0$`, 3, 'π/3; π; 5π/3|1,05; 3,14; 5,24', r`$(2\cos x-1)(\cos x+1)=0$. $\cos x=\frac12$: $\frac\pi3$, $\frac{5\pi}3$; $\cos x=-1$: $\pi$.`, 5],
        ] },
        { title: r`Lahenda võrrand lõigul $[0;2\pi]$.`, parts: [
          [r`$\sin2x=1$`, 2, 'π/4; 5π/4|0,79; 3,93', r`$2x=\dfrac\pi2+2n\pi$, $x=\dfrac\pi4+n\pi$: $\dfrac\pi4$ ja $\dfrac{5\pi}4$.`],
          [r`$\sin\left(x-\dfrac\pi6\right)=0$`, 2, 'π/6; 7π/6|0,52; 3,67', r`$x-\dfrac\pi6=n\pi$, $x=\dfrac\pi6+n\pi$: $\dfrac\pi6$ ja $\dfrac{7\pi}6$.`],
        ] },
        { title: 'Kasuta valemilehte.', parts: [
          [r`Näita, et $\cos2x+2\sin^2x=1$.`, 2, '', r`$\cos2x=\cos^2x-\sin^2x$, seega $\cos^2x-\sin^2x+2\sin^2x=\cos^2x+\sin^2x=1$.`, 3],
          [r`Lahenda võrrand $\cos2x=\sin x$ lõigul $[0;2\pi]$.`, 3, 'π/6; 5π/6; 3π/2|0,52; 2,62; 4,71', r`$1-2\sin^2x=\sin x$, $2\sin^2x+\sin x-1=0$, $(2\sin x-1)(\sin x+1)=0$. $\sin x=\frac12$: $\frac\pi6$, $\frac{5\pi}6$; $\sin x=-1$: $\frac{3\pi}2$.`, 6],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioonid $f(x)=\sin2x$ ja $g(x)=\cos\left(\dfrac\pi2-x\right)$.`, parts: [
        [r`Näita, et $g(x)=\sin x$.`, 2, '', r`Valemilehe taandamisvalem: $\cos\left(\dfrac\pi2-\alpha\right)=\sin\alpha$.`, 2],
        [r`Lahenda võrrand $f(x)=g(x)$ lõigul $[0;2\pi]$.`, 6, '0; π/3; π; 5π/3; 2π|0; 1,05; 3,14; 5,24; 6,28', r`$2\sin x\cos x-\sin x=0$, $\sin x\,(2\cos x-1)=0$. $\sin x=0$: $0$, $\pi$, $2\pi$; $\cos x=\frac12$: $\frac\pi3$, $\frac{5\pi}3$.`, 8],
        [r`Mitu ühist punkti on funktsioonide $f$ ja $g$ graafikutel lõigul $[0;2\pi]$?`, 2, '5', 'Iga lahend annab ühe ühise punkti: 5.', 1],
      ] },
      self: ['Tean täpseid väärtusi radiaanides.', 'Kasutan valemilehe valemeid.', 'Valin lahendid antud lõigult.'],
    },
    {
      title: 'Trigonomeetrilised funktsioonid ja tuletis',
      ru: 'Тригонометрические функции и их производные',
      course: 'IV, IX',
      slots: [8, 9],
      exam: 'II osa, 10-punktiline ülesanne: siinus- ja koosinusfunktsiooni omadused, tuletis, ekstreemumid lõigul.',
      can: 'Õpilane loeb trigonomeetrilise funktsiooni omadusi, leiab selle tuletise ning suurima ja vähima väärtuse lõigul.',
      theory: [
        r`$y=a\sin(bx)+c$: amplituud $|a|$, periood $\dfrac{2\pi}{|b|}$; $\tan x$ periood $\pi$ — *pähe*`,
        r`$(\sin x)'=\cos x$, $\;(\cos x)'=-\sin x$, $\;(\tan x)'=\dfrac1{\cos^2x}$ — *valemilehel*`,
        r`Liitfunktsioon: $\big(f(g(x))\big)'=f'(g(x))\cdot g'(x)$, nt $(\sin kx)'=k\cos kx$ — *pähe*`,
        r`Kaar $l=r\alpha$, sektor $S=\dfrac{r^2\alpha}{2}$ ($\alpha$ radiaanides) — *pähe*`,
      ],
      ru_hint: [
        'Таблица производных есть на листе формул, но правила (произведение, частное, сложная функция) — учим наизусть.',
        'Период y = sin(bx) равен 2π/b.',
        'Наибольшее значение на отрезке: сравни значения в критических точках и на концах отрезка.',
      ],
      example: {
        task: r`Antud on $f(x)=2\sin2x$. Leia amplituud, periood, $f'(x)$ ja maksimumkohad lõigul $[0;\pi]$.`,
        steps: [
          r`Amplituud $2$, periood $\dfrac{2\pi}2=\pi$.`,
          r`$f'(x)=2\cos2x\cdot2=4\cos2x$.`,
          r`$f'(x)=0$: $2x=\dfrac\pi2+n\pi$, $x=\dfrac\pi4+\dfrac{n\pi}2$. Maksimum $f\left(\frac\pi4\right)=2$.`,
        ],
        graph: { fns: 'y = 2sin(2x)', xmin: -0.5, xmax: 6.5, ymin: -2.5, ymax: 2.5, step: 0.5, stepY: 0.5, labelEvery: 2, points: 'M(0.79; 2)', caption: 'y = 2 sin 2x, maksimum kohal x = π/4 ≈ 0,79' },
      },
      practice: [
        { title: r`Antud on $f(x)=3\cos2x-1$.`, parts: [
          ['Amplituud', 1, '3', r`$|a|=3$`],
          ['Periood', 1, 'π|3,14', r`$\dfrac{2\pi}2=\pi$`],
          ['Suurim väärtus', 1, '2', r`$3\cdot1-1=2$`],
          ['Vähim väärtus', 1, '-4', r`$3\cdot(-1)-1=-4$`],
        ] },
        { title: 'Leia tuletis.', parts: [
          [r`$(\sin3x)'$`, 1, '3cos3x|3cos(3x)', r`$\cos3x\cdot3=3\cos3x$`],
          [r`$(x\cos x)'$`, 2, 'cosx-xsinx|cos(x)-xsin(x)', r`Korrutis: $1\cdot\cos x+x\cdot(-\sin x)=\cos x-x\sin x$`],
          [r`$f(x)=\tan x+2x$; leia $f'\left(\frac\pi4\right)$.`, 1, '4', r`$f'(x)=\dfrac1{\cos^2x}+2$; $\cos^2\frac\pi4=\frac12$: $2+2=4$`],
          [r`$f(x)=\sin^2x$; leia $f'\left(\frac\pi6\right)$.`, 2, '√3/2|0,87', r`$f'(x)=2\sin x\cos x=\sin2x$; $\sin\frac\pi3=\frac{\sqrt3}2\approx0{,}87$`],
        ] },
        { title: r`Ringi raadius on 6 cm ja kesknurk $\dfrac{2\pi}3$.`, parts: [
          ['Leia kaare pikkus.', 1, '4π|12,57', r`$6\cdot\dfrac{2\pi}3=4\pi\approx12{,}57$ cm`],
          ['Leia sektori pindala.', 1, '12π|37,7', r`$\dfrac{36\cdot\frac{2\pi}3}{2}=12\pi\approx37{,}70$ cm²`],
        ] },
        { title: r`Koosta funktsiooni $f(x)=\sin x+\cos x$ graafiku puutuja võrrand kohal $x=\dfrac\pi2$.`, parts: [
          ['', 3, '-x+π/2+1|-x+1+π/2|y=-x+π/2+1', r`$f\left(\frac\pi2\right)=1$, $f'(x)=\cos x-\sin x$, $f'\left(\frac\pi2\right)=-1$. $y-1=-\left(x-\frac\pi2\right)$, $y=-x+\frac\pi2+1$.`, 5],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=2\sin x+\cos2x$ lõigul $[0;\pi]$.`, parts: [
        [r`Leia $f'(x)$.`, 2, '2cosx-2sin2x|2cos(x)-2sin(2x)', r`$f'(x)=2\cos x-2\sin2x$`, 2],
        [r`Leia tuletise nullkohad lõigul $[0;\pi]$.`, 4, 'π/6; π/2; 5π/6|0,52; 1,57; 2,62', r`$2\cos x-4\sin x\cos x=2\cos x(1-2\sin x)=0$. $\cos x=0$: $\frac\pi2$; $\sin x=\frac12$: $\frac\pi6$, $\frac{5\pi}6$.`, 6],
        ['Leia funktsiooni suurim ja vähim väärtus sellel lõigul.', 4, '1,5; 1', r`$f(0)=1$, $f\left(\frac\pi6\right)=1+\frac12=1{,}5$, $f\left(\frac\pi2\right)=2-1=1$, $f\left(\frac{5\pi}6\right)=1{,}5$, $f(\pi)=1$. Suurim $1{,}5$, vähim $1$.`, 5],
      ] },
      self: ['Leian amplituudi ja perioodi.', 'Leian liitfunktsiooni tuletise.', 'Leian suurima ja vähima väärtuse lõigul.'],
    },
    {
      title: 'Eksponent- ja logaritmfunktsioon',
      ru: 'Показательная и логарифмическая функции',
      course: 'VIII',
      slots: [11],
      exam: 'II osa, 10-punktiline ülesanne: logaritmfunktsiooni nullkoht, graafikute lõikepunkt, logaritmvõrrand ja -võrratus.',
      can: 'Õpilane kasutab logaritmi omadusi, lahendab eksponent- ja logaritmvõrrandeid ning -võrratusi ja uurib nende funktsioonide graafikuid.',
      theory: [
        r`$\log_ab=c\Leftrightarrow a^c=b$; $\;\log_a(xy)=\log_ax+\log_ay$, $\;\log_a\dfrac xy=\log_ax-\log_ay$, $\;\log_ax^k=k\log_ax$ — *pähe*`,
        r`Aluse vahetus: $\log_ab=\dfrac{\ln b}{\ln a}$ — *pähe*`,
        r`$y=\log_ax$: määramispiirkond $x>0$; $a>1$ kasvab, $0<a<1$ kahaneb — võrratuses märk pöördub — *pähe*`,
        r`$(a^x)'=a^x\ln a$, $\;(e^x)'=e^x$, $\;(\log_ax)'=\dfrac1{x\ln a}$, $\;(\ln x)'=\dfrac1x$ — *valemilehel*`,
      ],
      ru_hint: [
        'Свойств логарифмов на листе формул нет — только производные. Учим свойства наизусть.',
        'Под логарифмом — только положительное число: после решения всегда проверяй ОДЗ.',
        'Основание меньше 1 → функция убывает → знак неравенства меняется.',
      ],
      example: {
        task: r`Lahenda võrrand $\log_2(x+1)+\log_2(x-1)=3$.`,
        steps: [
          r`Määramispiirkond: $x>1$.`,
          r`$\log_2\big((x+1)(x-1)\big)=3$, $x^2-1=8$, $x=3$ või $x=-3$.`,
          r`$x=-3$ ei sobi. Vastus: $x=3$.`,
        ],
        graph: { fns: 'y = ln(x + 1)/ln(2) + ln(x - 1)/ln(2)\ny = 3', xmin: -1, xmax: 6, ymin: -3, ymax: 5, step: 1, points: 'P(3; 3)', caption: 'tumesinine: y = log₂(x + 1) + log₂(x − 1) · roheline: y = 3' },
      },
      practice: [
        { title: 'Arvuta.', parts: [
          [r`$\log_381+\log_2\dfrac18$`, 1, '1', r`$4+(-3)=1$`],
          [r`$\lg25+\lg4$`, 1, '2', r`$\lg100=2$`],
          [r`$\log_52$ (kahe kümnendkohani)`, 1, '0,43', r`$\dfrac{\ln2}{\ln5}\approx0{,}43$`],
          [r`$e^{\ln7}$`, 1, '7', r`Logaritmi definitsioon: $7$`],
        ] },
        { title: 'Lahenda võrrand.', parts: [
          [r`$3^{2x}-4\cdot3^x+3=0$`, 2, '0; 1', r`$t=3^x$: $t^2-4t+3=0$, $t=1$ või $t=3$, seega $x=0$ või $x=1$.`, 4],
          [r`$2^x=7$`, 1, '2,81|log_2 7', r`$x=\log_27=\dfrac{\ln7}{\ln2}\approx2{,}81$`],
          [r`$e^{2x}=5$`, 1, '0,8|0,80|ln5/2', r`$2x=\ln5$, $x=\dfrac{\ln5}2\approx0{,}80$`],
        ] },
        { title: 'Lahenda võrratus.', parts: [
          [r`$2^{x-1}>8$`, 1, 'x>4|(4;∞)', r`$x-1>3$, $x>4$ (alus $2>1$)`],
          [r`$\log_{0{,}5}(x-2)\ge-1$`, 2, '2<x<=4|2<x≤4|(2;4]', r`$x-2>0$; alus $<1$, märk pöördub: $x-2\le0{,}5^{-1}=2$. Seega $2<x\le4$.`, 4],
          [r`$\lg(2x-4)<1$`, 2, '2<x<7|(2;7)', r`$0<2x-4<10$, $2<x<7$.`, 4],
        ] },
        { title: r`Antud on $f(x)=\ln(9-x^2)$.`, parts: [
          ['Leia määramispiirkond.', 1, '-3<x<3|(-3;3)', r`$9-x^2>0$, $-3<x<3$`],
          ['Leia nullkohad.', 2, '2,83; -2,83|2√2; -2√2', r`$9-x^2=1$, $x^2=8$, $x=\pm2\sqrt2\approx\pm2{,}83$`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioonid $f(x)=\log_2(x+2)$ ja $g(x)=3-\log_2x$.`, parts: [
        [r`Leia funktsiooni $f$ graafiku ja x-telje lõikepunkt $A$.`, 2, '(-1;0)', r`$\log_2(x+2)=0$, $x+2=1$, $x=-1$: $A(-1;0)$.`, 2],
        ['Leia mõlema funktsiooni määramispiirkond.', 2, 'x>-2; x>0|(-2;∞); (0;∞)', r`$f$: $x+2>0$, $x>-2$; $\;g$: $x>0$.`, 2],
        [r`Leia graafikute lõikepunkt $B$.`, 4, '(2;2)', r`$\log_2(x+2)=3-\log_2x$, $\log_2\big(x(x+2)\big)=3$, $x^2+2x-8=0$, $x=2$ või $x=-4$; $x=-4$ ei sobi. $y=\log_24=2$: $B(2;2)$.`, 6],
        [r`Lahenda võrratus $f(x)>g(x)$.`, 2, 'x>2|(2;∞)', r`Kui $x>0$: $x(x+2)>8$, st $x>2$ ($f$ kasvab, $g$ kahaneb).`, 3],
      ] },
      self: ['Kasutan logaritmi omadusi.', 'Kontrollin määramispiirkonda.', 'Arvestan alusega võrratuses.'],
    },
    {
      title: 'Tuletis ja puutuja',
      ru: 'Производная и касательная',
      course: 'IX, X',
      slots: [9],
      exam: 'II osa, 10-punktilise ülesande esimene osa: tuletis, puutuja võrrand, paralleelne puutuja; liikumise kiirus.',
      can: 'Õpilane leiab korrutise, jagatise ja liitfunktsiooni tuletise ning koostab graafiku puutuja võrrandi.',
      theory: [
        r`Tuletiste tabel: $(x^n)'=nx^{n-1}$, $(\sqrt x)'$, $(e^x)'$, $(\ln x)'$, $(\sin x)'$, … — *valemilehel*`,
        r`$(uv)'=u'v+uv'$, $\;\left(\dfrac uv\right)'=\dfrac{u'v-uv'}{v^2}$, $\;\big(f(g(x))\big)'=f'(g(x))\,g'(x)$ — *pähe*`,
        r`Puutuja: $y-f(a)=f'(a)(x-a)$; tõus $k=f'(a)$; paralleelsetel sirgetel on sama tõus — *pähe*`,
        r`Liikumine: $v(t)=s'(t)$, $\;a(t)=v'(t)$ — *pähe*`,
      ],
      ru_hint: [
        'Таблица производных — на листе формул; правила дифференцирования и уравнение касательной — наизусть.',
        'Касательная параллельна прямой y = kx + b, если f\'(x) = k.',
        'Сначала найди f(a) и f\'(a), потом подставь в уравнение касательной.',
      ],
      example: {
        task: r`Leia $f(x)=xe^x$ tuletis ja graafiku puutuja kohal $x=0$.`,
        steps: [
          r`Korrutise tuletis: $f'(x)=e^x+xe^x=(x+1)e^x$.`,
          r`$f(0)=0$, $f'(0)=1$.`,
          r`$y-0=1\cdot(x-0)$: puutuja $y=x$.`,
        ],
        graph: { fns: 'y = x*exp(x)\ny = x', xmin: -4, xmax: 2, ymin: -2, ymax: 4, step: 1, points: 'O(0; 0)', caption: 'tumesinine: y = x·eˣ · roheline: puutuja y = x' },
      },
      practice: [
        { title: 'Leia tuletis.', parts: [
          [r`$(x^2\ln x)'$`, 1, '2xlnx+x|x+2xlnx|x(2lnx+1)', r`$2x\ln x+x^2\cdot\dfrac1x=2x\ln x+x$`],
          [r`$(e^{3x})'$`, 1, '3e^(3x)|3e^{3x}', r`$e^{3x}\cdot3=3e^{3x}$`],
          [r`$\big((2x+1)^5\big)'$`, 1, '10(2x+1)^4', r`$5(2x+1)^4\cdot2=10(2x+1)^4$`],
          [r`$\left(\dfrac{x}{x+1}\right)'$`, 2, '1/(x+1)^2|1/(x+1)²', r`$\dfrac{1\cdot(x+1)-x\cdot1}{(x+1)^2}=\dfrac1{(x+1)^2}$`],
        ] },
        { title: 'Arvuta tuletise väärtus.', parts: [
          [r`$f(x)=\sqrt{x^2+9}$, leia $f'(4)$.`, 2, '0,8', r`$f'(x)=\dfrac{2x}{2\sqrt{x^2+9}}=\dfrac{x}{\sqrt{x^2+9}}$; $f'(4)=\dfrac45=0{,}8$`],
          [r`$f(x)=\ln(2x-3)$, leia $f'(2)$.`, 1, '2', r`$f'(x)=\dfrac{2}{2x-3}$; $f'(2)=2$`],
          [r`$f(x)=e^x\sin x$, leia $f'(0)$.`, 1, '1', r`$f'(x)=e^x\sin x+e^x\cos x$; $f'(0)=0+1=1$`],
        ] },
        { title: r`Antud on $f(x)=x^3-2x+1$.`, parts: [
          [r`Koosta puutuja võrrand kohal $x=1$.`, 2, 'x-1|y=x-1', r`$f(1)=0$, $f'(x)=3x^2-2$, $f'(1)=1$: $y=x-1$.`],
          [r`Leia punktid, kus puutuja on paralleelne sirgega $y=10x$.`, 3, '(2;5); (-2;-3)', r`$3x^2-2=10$, $x=\pm2$; $f(2)=5$, $f(-2)=-3$.`, 4],
        ] },
        { title: r`Keha liigub sirgjooneliselt, teepikkus $s(t)=t^3-6t^2+9t$ (m, aeg sekundites).`, parts: [
          [r`Leia kiirus hetkel $t=2$.`, 1, '-3', r`$v(t)=3t^2-12t+9$, $v(2)=-3$ m/s`],
          ['Millistel hetkedel keha seisab?', 2, '1; 3', r`$3(t-1)(t-3)=0$: $t=1$ s ja $t=3$ s.`],
          [r`Leia kiirendus hetkel $t=3$.`, 1, '6', r`$a(t)=6t-12$, $a(3)=6$ m/s²`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=2\ln x+x^2$.`, parts: [
        [r`Leia $f'(x)$.`, 2, '2/x+2x|2x+2/x', r`$f'(x)=\dfrac2x+2x$`, 2],
        [r`Koosta graafiku puutuja võrrand kohal $x=1$.`, 3, '4x-3|y=4x-3', r`$f(1)=0+1=1$, $f'(1)=4$: $y-1=4(x-1)$, $y=4x-3$.`, 4],
        [r`Leia kohad, kus puutuja on paralleelne sirgega $y=5x+2$.`, 3, '2; 0,5', r`$\dfrac2x+2x=5$, $2x^2-5x+2=0$, $x=2$ või $x=0{,}5$ — mõlemad $>0$.`, 4],
        [r`Kas kohal $x=1$ tõmmatud puutuja läbib punkti $(2;5)$? Põhjenda.`, 2, '', r`$y(2)=4\cdot2-3=5$ — jah, läbib.`, 2],
      ] },
      self: ['Kasutan korrutise, jagatise ja liitfunktsiooni tuletise reeglit.', 'Koostan puutuja võrrandi.', 'Leian paralleelse puutuja koha.'],
    },
    {
      title: 'Funktsiooni uurimine',
      ru: 'Исследование функции',
      course: 'X',
      slots: [5],
      exam: 'I osa, 10-punktiline ülesanne: kasvamis- ja kahanemisvahemik, suurim väärtus lõigul, kumerus ja käänupunkt.',
      can: 'Õpilane uurib funktsiooni tuletiste abil: ekstreemumid, monotoonsus, kumerus, nõgusus, käänupunkt, suurim ja vähim väärtus lõigul.',
      theory: [
        r`$f'(x)>0$ — kasvab, $f'(x)<0$ — kahaneb; $f'(x)=0$ ja märgimuutus — ekstreemum — *pähe*`,
        r`$f''(x)<0$ — graafik on **kumer**, $f''(x)>0$ — **nõgus**; $f''$ märgimuutus — käänupunkt — *pähe*`,
        r`Suurim ja vähim väärtus lõigul: kriitilised kohad lõigul ja lõigu otspunktid — *pähe*`,
        r`Tuletiste tabel — *valemilehel*`,
      ],
      ru_hint: [
        'Внимание: в эстонской школе „kumer” = f\'\' < 0 (выпуклая вверх), „nõgus” = f\'\' > 0.',
        'Наибольшее значение на отрезке ищи среди критических точек внутри отрезка И на концах.',
        'Знаки производной покажи на числовой оси — это часть решения. Таблица производных есть на листе формул.',
      ],
      example: {
        task: r`Uuri funktsiooni $f(x)=x^3-6x^2+9x+1$.`,
        steps: [
          r`$f'(x)=3x^2-12x+9=3(x-1)(x-3)$: kasvab $x<1$ ja $x>3$, kahaneb $1<x<3$.`,
          r`Maksimum $M(1;5)$, miinimum $N(3;1)$.`,
          r`$f''(x)=6x-12$: kumer $x<2$, nõgus $x>2$, käänupunkt $K(2;3)$.`,
        ],
        graph: { fns: 'y = x^3 - 6x^2 + 9x + 1', xmin: -1, xmax: 5, ymin: -2, ymax: 7, step: 1, points: 'M(1; 5)\nN(3; 1)\nK(2; 3)' },
      },
      practice: [
        { title: r`Antud on $f(x)=x^4-2x^2$.`, parts: [
          ['Leia nullkohad.', 1, '0; √2; -√2|0; 1,41; -1,41', r`$x^2(x^2-2)=0$: $x=0$, $x=\pm\sqrt2$`],
          ['Leia ekstreemumkohad.', 2, '-1; 0; 1', r`$f'(x)=4x^3-4x=4x(x-1)(x+1)$: maksimum $x=0$, miinimumid $x=\pm1$.`],
          ['Leia käänukohad.', 2, '0,58; -0,58|√3/3; -√3/3', r`$f''(x)=12x^2-4=0$, $x=\pm\dfrac1{\sqrt3}\approx\pm0{,}58$`],
        ] },
        { title: r`Antud on $f(x)=xe^{-x}$.`, parts: [
          ['Leia kasvamisvahemik.', 2, 'x<1|(-∞;1)', r`$f'(x)=e^{-x}-xe^{-x}=e^{-x}(1-x)>0$, kui $x<1$.`],
          ['Leia maksimumpunkt.', 2, '(1;0,37)|(1;1/e)', r`$x=1$, $f(1)=e^{-1}\approx0{,}37$.`],
        ] },
        { title: r`Leia funktsiooni $f(x)=2x^3-3x^2-12x$ suurim ja vähim väärtus lõigul $[-2;3]$.`, parts: [
          ['Suurim väärtus', 2, '7', r`$f'(x)=6(x-2)(x+1)$. $f(-2)=-4$, $f(-1)=7$, $f(2)=-20$, $f(3)=-9$. Suurim $7$.`, 5],
          ['Vähim väärtus', 1, '-20', r`Vähim $f(2)=-20$.`],
        ] },
        { title: r`Antud on $f(x)=x^3-3x^2+2$.`, parts: [
          ['Leia kumerusvahemik.', 2, 'x<1|(-∞;1)', r`$f''(x)=6x-6<0$, kui $x<1$.`],
          ['Leia käänupunkt.', 1, '(1;0)', r`$f''(1)=0$, märk muutub; $f(1)=0$: $(1;0)$.`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=-x^3+3x^2+9x-2$.`, parts: [
        ['Leia funktsiooni kasvamisvahemik.', 3, '-1<x<3|(-1;3)', r`$f'(x)=-3x^2+6x+9=-3(x-3)(x+1)$. $f'(x)>0$, kui $-1<x<3$.`, 5],
        [r`Leia funktsiooni suurim väärtus lõigul $[0;4]$.`, 3, '25', r`Lõigul on kriitiline koht $x=3$. $f(0)=-2$, $f(3)=-27+27+27-2=25$, $f(4)=-64+48+36-2=18$. Suurim $25$.`, 5],
        ['Leia graafiku käänupunkt.', 2, '(1;9)', r`$f''(x)=-6x+6=0$, $x=1$; $f(1)=-1+3+9-2=9$: $(1;9)$.`, 3],
        [r`Kas koht $x=2$ kuulub graafiku kumerusvahemikku? Põhjenda.`, 2, '', r`$f''(2)=-12+6=-6<0$ — jah, graafik on seal kumer.`, 2],
      ] },
      self: ['Leian kasvamis- ja kahanemisvahemikud.', 'Leian suurima väärtuse lõigul.', 'Leian kumeruse ja käänupunkti teise tuletisega.'],
    },
    {
      title: 'Ekstreemumülesanded',
      ru: 'Задачи на наибольшее и наименьшее значение',
      course: 'X, XIV',
      slots: [5],
      exam: 'I või II osa, 10-punktiline ülesanne: koosta optimeeritav funktsioon, leia selle suurim või vähim väärtus ja põhjenda.',
      can: 'Õpilane koostab tekstist ühe muutuja funktsiooni ning leiab tuletise abil selle suurima või vähima väärtuse.',
      theory: [
        r`1. Tähista muutuja $x$, kirjuta selle lubatud piirkond — *pähe*`,
        r`2. Avalda optimeeritav suurus ühe muutuja funktsioonina (kasuta tingimust teise suuruse avaldamiseks) — *pähe*`,
        r`3. $f'(x)=0$, põhjenda: $f''$ märk või $f'$ märgimuutus — *pähe*`,
        r`Kehade ruumala ja pindala valemid ei ole valemilehel — *pähe*`,
      ],
      ru_hint: [
        'Главное — составить функцию одной переменной; вторую величину выражаем из условия.',
        'Не забудь обосновать, что это максимум (минимум): знак f\' или f\'\'.',
        'Ответ — на вопрос задачи: размеры, а не только x. Формул объёмов и площадей на листе формул нет.',
      ],
      example: {
        task: 'Ristküliku ümbermõõt on 40 cm. Millise küljepikkuse korral on pindala suurim?',
        steps: [
          r`Küljed $x$ ja $20-x$, $0<x<20$; $S(x)=x(20-x)=20x-x^2$.`,
          r`$S'(x)=20-2x=0$, $x=10$; $S''=-2<0$ — maksimum.`,
          r`Ruut küljega 10 cm, $S=100$ cm².`,
        ],
        graph: { fns: 'y = 20x - x^2', xmin: -1, xmax: 21, ymin: -10, ymax: 110, step: 2, stepY: 20, labelEvery: 2, points: 'M(10; 100)', caption: 'S(x) = x(20 − x)' },
      },
      practice: [
        { title: 'Arv 12 jagatakse kaheks positiivseks liidetavaks nii, et esimese ruudu ja teise kahekordse summa on vähim. Leia liidetavad.', parts: [
          ['', 2, '1; 11', r`$f(x)=x^2+2(12-x)$, $f'(x)=2x-2=0$, $x=1$; $f''=2>0$ — miinimum. Liidetavad $1$ ja $11$.`, 4],
        ] },
        { title: 'Ruudukujulisest papist küljega 30 cm lõigatakse nurkadest välja võrdsed ruudud ja painutatakse kaaneta karp.', parts: [
          ['Millise väljalõigatud ruudu külje korral on karbi ruumala suurim?', 3, '5', r`$V(x)=x(30-2x)^2$, $0<x<15$. $V'(x)=(30-2x)(30-6x)=0$, $x=5$ ($x=15$ ei sobi); $V'$ muutub $+\to-$.`, 5],
          ['Leia suurim ruumala.', 1, '2000', r`$V(5)=5\cdot20^2=2000$ cm³`],
        ] },
        { title: 'Ristkülikukujuline aed piiratakse ühest küljest seinaga, teistest külgedest 60 m pikkuse aiaga.', parts: [
          ['Leia aia mõõtmed, mille korral pindala on suurim.', 2, '15; 30', r`Seinaga risti küljed $x$, paralleelne $60-2x$: $S=x(60-2x)$, $S'=60-4x=0$, $x=15$; mõõtmed 15 m ja 30 m.`, 4],
          ['Leia suurim pindala.', 1, '450', r`$15\cdot30=450$ m²`],
        ] },
        { title: 'Silindrikujulise purgi ruumala on 1000 cm³. Millise raadiuse korral kulub purgile kõige vähem plekki?', parts: [
          ['Leia raadius.', 3, '5,42', r`$H=\dfrac{1000}{\pi r^2}$, $S=2\pi r^2+\dfrac{2000}{r}$, $S'=4\pi r-\dfrac{2000}{r^2}=0$, $r^3=\dfrac{500}{\pi}$, $r\approx5{,}42$ cm.`, 5],
          ['Leia kõrgus.', 1, '10,84', r`$H=\dfrac{1000}{\pi r^2}\approx10{,}84$ cm $=2r$.`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Ruudukujulise põhjaga kaaneta kasti ruumala on 32 dm³. Leia kasti mõõtmed, mille korral kulub selle valmistamiseks kõige vähem materjali.', parts: [
        [r`Tähista põhiserv $x$ ja avalda kasti pindala $S$ muutuja $x$ funktsioonina.`, 3, 'x^2+128/x|x²+128/x', r`Kõrgus $h=\dfrac{32}{x^2}$; $S=x^2+4xh=x^2+\dfrac{128}{x}$, $x>0$.`, 5],
        [r`Leia $x$, mille korral pindala on vähim, ja põhjenda, et see on miinimum.`, 4, '4', r`$S'(x)=2x-\dfrac{128}{x^2}=0$, $x^3=64$, $x=4$. $S''(x)=2+\dfrac{256}{x^3}>0$ — miinimum.`, 6],
        ['Leia kasti kõrgus ja kulunud materjali pindala.', 3, '2; 48', r`$h=\dfrac{32}{16}=2$ dm, $S=16+\dfrac{128}{4}=48$ dm². Vastus: põhi 4 dm × 4 dm, kõrgus 2 dm, materjali 48 dm².`, 4],
      ] },
      self: ['Koostan optimeeritava funktsiooni.', 'Leian tuletise nullkoha ja põhjendan ekstreemumi.', 'Kirjutan vastuse ülesande küsimusele.'],
    },
    {
      title: 'Integraal, pindala ja pöördkeha ruumala',
      ru: 'Интеграл, площадь и объём тела вращения',
      course: 'XI',
      slots: [9],
      exam: 'II osa, 10-punktiline ülesanne: puutuja ja parabool, kujundi viirutamine, pindala integraaliga; pöördkeha ruumala.',
      can: 'Õpilane leiab algfunktsiooni, arvutab määratud integraali, kahe joonega piiratud pindala ja lihtsa pöördkeha ruumala.',
      theory: [
        r`$\int x^n\,dx=\dfrac{x^{n+1}}{n+1}+C$, $\int\dfrac1x\,dx=\ln|x|+C$, $\int e^x\,dx$, $\int a^x\,dx$, $\int\sin x\,dx$, $\int\cos x\,dx$ — *valemilehel*`,
        r`Newtoni-Leibnizi valem $\int_a^bf(x)\,dx=F(b)-F(a)$; $\int e^{kx}dx=\dfrac{e^{kx}}k+C$ — *pähe*`,
        r`Kahe joone vahel: $S=\int_a^b\big(f_{\text{ülemine}}(x)-f_{\text{alumine}}(x)\big)\,dx$ — *pähe*`,
        r`Pöördkeha ruumala (pöörlemine ümber x-telje): $V=\pi\int_a^bf^2(x)\,dx$ — *pähe*`,
      ],
      ru_hint: [
        'Таблица интегралов — на листе формул; формула Ньютона–Лейбница, площадь между кривыми и объём тела вращения — наизусть.',
        'Сначала найди точки пересечения линий — это пределы интегрирования.',
        'Сделай эскиз: видно, какая линия сверху. За чертёж и штриховку дают баллы.',
      ],
      example: {
        task: r`Leia joontega $y=x^2$ ja $y=x+2$ piiratud kujundi pindala.`,
        steps: [
          r`Lõikepunktid: $x^2=x+2$, $x=-1$ ja $x=2$. Sirge on ülal.`,
          r`$S=\displaystyle\int_{-1}^{2}(x+2-x^2)\,dx=\left[\frac{x^2}2+2x-\frac{x^3}3\right]_{-1}^{2}$`,
          r`$=\dfrac{10}3-\left(-\dfrac76\right)=\dfrac{27}6=4{,}5$.`,
        ],
        graph: { fns: 'y = x^2\ny = x + 2', xmin: -2, xmax: 3, ymin: -1, ymax: 5, step: 1, shade: 'x + 2 | x^2; -1; 2', points: 'A(-1; 1)\nB(2; 4)' },
      },
      practice: [
        { title: 'Arvuta integraal.', parts: [
          [r`$\displaystyle\int_1^e\frac1x\,dx$`, 1, '1', r`$[\ln x]_1^e=1-0=1$`],
          [r`$\displaystyle\int_0^{\frac\pi2}\cos x\,dx$`, 1, '1', r`$[\sin x]_0^{\frac\pi2}=1$`],
          [r`$\displaystyle\int_0^1e^x\,dx$`, 1, '1,72|e-1', r`$e-1\approx1{,}72$`],
          [r`$\displaystyle\int_0^{\ln2}e^{2x}\,dx$`, 2, '1,5', r`$\left[\dfrac{e^{2x}}2\right]_0^{\ln2}=\dfrac{4-1}{2}=1{,}5$`],
        ] },
        { title: 'Leia kujundi pindala.', parts: [
          [r`$y=\sin x$ ja x-telg lõigul $[0;\pi]$`, 1, '2', r`$[-\cos x]_0^\pi=1+1=2$`],
          [r`$y=\dfrac1x$, x-telg ja sirged $x=1$, $x=4$`, 2, '1,39|ln4|2ln2', r`$[\ln x]_1^4=\ln4\approx1{,}39$`],
        ] },
        { title: r`Leia joontega $y=6-x^2$ ja $y=x$ piiratud kujundi pindala.`, parts: [
          ['', 3, '125/6|20,83', r`$6-x^2=x$: $x=-3$, $x=2$. $\displaystyle\int_{-3}^{2}(6-x-x^2)\,dx=\left[6x-\frac{x^2}2-\frac{x^3}3\right]_{-3}^{2}=\frac{22}3+13{,}5=\frac{125}6\approx20{,}83$.`, 6],
        ] },
        { title: 'Kõver pöörleb ümber x-telje. Leia tekkiva keha ruumala.', parts: [
          [r`$y=\sqrt x$, $0\le x\le4$`, 2, '8π|25,13', r`$V=\pi\displaystyle\int_0^4x\,dx=\pi\cdot8=8\pi\approx25{,}13$`],
          [r`$y=x^2$, $0\le x\le1$`, 2, 'π/5|0,63', r`$V=\pi\displaystyle\int_0^1x^4\,dx=\dfrac\pi5\approx0{,}63$`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Antud on funktsioon $f(x)=x^2-4x+5$.`, grid: { xmin: -1, xmax: 5, ymin: -5, ymax: 6, step: 1, blank: true }, parts: [
        [r`Koosta graafiku puutuja võrrand punktis $B(3;2)$.`, 3, '2x-4|y=2x-4', r`$f'(x)=2x-4$, $k=f'(3)=2$: $y-2=2(x-3)$, $y=2x-4$.`, 4],
        ['Joonesta parabool ja puutuja ning viiruta kujund, mida piiravad parabool, puutuja ja y-telg.', 2, '', 'Parabool läbib punkte (0; 5), (1; 2), (2; 1), (3; 2), (4; 5); puutuja punkte (0; −4), (2; 0), (3; 2). Kujund on y-telje ja puutepunkti vahel.', 0],
        ['Arvuta selle kujundi pindala.', 5, '9', r`Parabool on puutujast ülal: $S=\displaystyle\int_0^3\big(x^2-4x+5-(2x-4)\big)\,dx=\int_0^3(x-3)^2\,dx=\left[\frac{(x-3)^3}3\right]_0^3=9$.`, 6],
      ] },
      self: ['Arvutan määratud integraali.', 'Leian kahe joone vahelise pindala.', 'Arvutan pöördkeha ruumala.'],
    },
    {
      title: 'Matemaatilised mudelid ja tekstülesanded',
      ru: 'Математические модели и текстовые задачи',
      course: 'XIV, VIII',
      slots: [11],
      exam: 'II osa, 10-punktiline rakendusülesanne: eksponent-, ruut- või lineaarne mudel, selle uurimine ja tõlgendamine.',
      can: 'Õpilane koostab reaalse protsessi mudeli (eksponent-, ruut- või lineaarne), kasutab seda arvutusteks ja tõlgendab tulemust.',
      theory: [
        r`Modelleerimine: suurused ja tähised → valem → arvutus → tõlgendus ja kontroll — *pähe*`,
        r`Kasv või kahanemine $p\%$ ajaühikus: $N(t)=N_0\left(1\pm\frac p{100}\right)^t$; $\;N(t)=N_0e^{kt}$ — *pähe*`,
        r`Poolestusaeg $T$: $m(t)=m_0\cdot0{,}5^{\frac tT}$ — *pähe*`,
        r`Muutumise kiirus on tuletis: $N'(t)$ — tuletiste tabel *valemilehel*`,
      ],
      ru_hint: [
        'Модель — это формула с понятными буквами: напиши, что такое t и в каких единицах.',
        'Уравнение вида aᵗ = b решаем логарифмированием: t = ln b / ln a.',
        'Проверь, имеет ли ответ смысл: время не отрицательное, число людей — целое. Формул моделей на листе формул нет.',
      ],
      example: {
        task: 'Radioaktiivse aine poolestusaeg on 8 päeva. Alguses on ainet 200 g. Kui palju on seda 20 päeva pärast?',
        steps: [
          r`Mudel: $m(t)=200\cdot0{,}5^{\frac t8}$ ($t$ päevades).`,
          r`$m(20)=200\cdot0{,}5^{2{,}5}\approx35{,}36$ g.`,
        ],
        graph: { fns: 'y = 200*0.5^(x/8)', xmin: -2, xmax: 34, ymin: -20, ymax: 220, step: 4, stepY: 40, labelEvery: 2, points: 'P(20; 35.36)', caption: 'm(t) = 200 · 0,5^(t/8)' },
      },
      practice: [
        { title: 'Linnas elas 2026. aastal 50 000 inimest. Rahvaarv väheneb 1,5% aastas.', parts: [
          ['Koosta mudel rahvaarvu jaoks.', 1, '', r`$N(t)=50\,000\cdot0{,}985^t$, $t$ — aastad alates 2026.`],
          ['Mitu inimest elab linnas 10 aasta pärast?', 1, '42987|42986,5', r`$50\,000\cdot0{,}985^{10}\approx42\,987$`],
          ['Mitme aasta pärast langeb rahvaarv esimest korda alla 40 000?', 2, '15', r`$0{,}985^t<0{,}8$, $t>\dfrac{\ln0{,}8}{\ln0{,}985}\approx14{,}8$: 15 aasta pärast.`, 4],
        ] },
        { title: r`Tee temperatuur $t$ minuti pärast on $T(t)=20+70e^{-0{,}05t}$ (°C).`, parts: [
          ['Mis on tee algtemperatuur?', 1, '90', r`$T(0)=20+70=90$ °C`],
          ['Mis on temperatuur 10 minuti pärast?', 1, '62,46|62,5', r`$20+70e^{-0{,}5}\approx62{,}46$ °C`],
          ['Millal jahtub tee 40 °C-ni?', 2, '25,06|25,1|25', r`$70e^{-0{,}05t}=20$, $e^{-0{,}05t}=\frac27$, $t=\dfrac{\ln3{,}5}{0{,}05}\approx25{,}1$ min`, 4],
        ] },
        { title: r`Visatud palli kõrgus $t$ sekundi pärast on $h(t)=-5t^2+20t+1{,}8$ (m).`, parts: [
          ['Leia suurim kõrgus.', 2, '21,8', r`$h'(t)=-10t+20=0$, $t=2$; $h(2)=21{,}8$ m`],
          ['Mitme sekundi pärast kukub pall maha?', 2, '4,09', r`$-5t^2+20t+1{,}8=0$, $t=\dfrac{20+\sqrt{436}}{10}\approx4{,}09$ s`],
        ] },
        { title: r`Firma kasum $x$ toote valmistamisel on $K(x)=-0{,}02x^2+16x-1200$ (€).`, parts: [
          ['Mitu toodet tuleb valmistada, et kasum oleks suurim?', 1, '400', r`$K'(x)=-0{,}04x+16=0$, $x=400$`],
          ['Kui suur on suurim kasum?', 1, '2000', r`$K(400)=-3200+6400-1200=2000$ €`],
          ['Millise toodete arvu korral on kasum positiivne? Kirjuta vähim ja suurim arv.', 3, '84; 716', r`$x^2-800x+60\,000<0$, $x=400\pm\sqrt{100\,000}$, $83{,}8<x<716{,}2$: 84 kuni 716 toodet.`, 5],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Patsiendile süstitakse 150 mg ravimit. Ravimi kogus veres väheneb iga tunniga 20%.', parts: [
        [r`Koosta funktsioon $m(t)$, mis näitab ravimi kogust veres $t$ tunni pärast.`, 2, '150*0,8^t|150·0,8^t', r`$m(t)=150\cdot0{,}8^t$`, 2],
        ['Kui palju ravimit on veres 3 tunni pärast?', 2, '76,8', r`$150\cdot0{,}8^3=150\cdot0{,}512=76{,}8$ mg`, 2],
        ['Ravim toimib, kui seda on veres vähemalt 30 mg. Kui kaua ravim toimib?', 3, '7,21|7,2', r`$150\cdot0{,}8^t\ge30$, $0{,}8^t\ge0{,}2$, $t\le\dfrac{\ln0{,}2}{\ln0{,}8}\approx7{,}21$ h.`, 4],
        [r`Kui kiiresti väheneb ravimi kogus hetkel $t=2$ (mg/h)?`, 3, '21,42|-21,42', r`$m'(t)=150\cdot0{,}8^t\ln0{,}8$; $m'(2)=96\ln0{,}8\approx-21{,}42$: kogus väheneb kiirusega $\approx21{,}42$ mg/h.`, 4],
      ] },
      self: ['Koostan mudeli ja kirjutan tähiste tähenduse.', 'Lahendan eksponentvõrrandi logaritmiga.', 'Tõlgendan tulemust ülesande kontekstis.'],
    },
    {
      title: 'Vektorid ja joone võrrandid tasandil',
      ru: 'Векторы и уравнения линий на плоскости',
      course: 'V',
      slots: [10],
      exam: 'II osa, 10-punktiline ülesanne: hulknurk koordinaattasandil — sirgete võrrandid, ristseis, tippude koordinaadid, ringjoon.',
      can: 'Õpilane kasutab vektoreid, koostab sirge ja ringjoone võrrandi ning leiab lõikepunkte, nurki ja pikkusi.',
      theory: [
        r`$\overrightarrow{AB}=(x_2-x_1;\,y_2-y_1)$, $|\vec a|=\sqrt{a_1^2+a_2^2}$, keskpunkt $\left(\frac{x_1+x_2}2;\frac{y_1+y_2}2\right)$ — *pähe*`,
        r`$\vec a\cdot\vec b=a_1b_1+a_2b_2=|\vec a||\vec b|\cos\varphi$; $\;\vec a\perp\vec b\Leftrightarrow\vec a\cdot\vec b=0$ — *pähe*`,
        r`Sirge: $y-y_1=k(x-x_1)$, $k=\dfrac{y_2-y_1}{x_2-x_1}$; ristsirged $k_1k_2=-1$; nurk $\tan\varphi=\left|\dfrac{k_2-k_1}{1+k_1k_2}\right|$ — *pähe*`,
        r`Ringjoon: $(x-a)^2+(y-b)^2=r^2$ — *pähe*`,
      ],
      ru_hint: [
        'Формул векторов и уравнений прямой на листе формул нет — учим наизусть.',
        'Перпендикулярные прямые: произведение угловых коэффициентов равно −1.',
        'Сделай чертёж в системе координат — так легче проверить ответ.',
      ],
      example: {
        task: r`Antud on $A(1;2)$ ja $B(5;4)$. Koosta lõigu $AB$ keskristsirge võrrand.`,
        steps: [
          r`Keskpunkt $M(3;3)$, $k_{AB}=\dfrac{4-2}{5-1}=0{,}5$.`,
          r`Ristsirge tõus $k=-\dfrac1{0{,}5}=-2$.`,
          r`$y-3=-2(x-3)$: $y=-2x+9$.`,
        ],
        graph: { fns: 'y = 0.5x + 1.5\ny = -2x + 9', xmin: -1, xmax: 7, ymin: -1, ymax: 8, step: 1, points: 'A(1; 2)\nB(5; 4)\nM(3; 3)', segments: 'A-B' },
      },
      practice: [
        { title: r`Antud on $\vec a=(3;-4)$ ja $\vec b=(2;1)$.`, parts: [
          [r`$|\vec a|$`, 1, '5', r`$\sqrt{9+16}=5$`],
          [r`$\vec a\cdot\vec b$`, 1, '2', r`$6-4=2$`],
          [r`Nurk vektorite vahel (kraadides)`, 2, '79,7|79,70', r`$\cos\varphi=\dfrac{2}{5\sqrt5}\approx0{,}179$, $\varphi\approx79{,}7^\circ$`],
          [r`Leia $m$, mille korral $\vec c=(m;6)\perp\vec a$.`, 1, '8', r`$3m-24=0$, $m=8$`],
        ] },
        { title: r`Sirge läbib punkte $A(-1;3)$ ja $B(3;-5)$.`, parts: [
          ['Koosta sirge võrrand.', 2, 'y=-2x+1|-2x+1|2x+y-1=0', r`$k=\dfrac{-8}{4}=-2$; $y-3=-2(x+1)$, $y=-2x+1$.`],
          [r`Leia selle sirge ja sirge $y=x-2$ lõikepunkt.`, 1, '(1;-1)', r`$-2x+1=x-2$, $x=1$, $y=-1$.`],
          ['Leia sirgete vaheline nurk.', 2, '71,57|71,6', r`$\tan\varphi=\left|\dfrac{1-(-2)}{1+(-2)\cdot1}\right|=3$, $\varphi\approx71{,}57^\circ$`],
        ] },
        { title: r`Ringjoon $(x-2)^2+(y+1)^2=25$.`, parts: [
          ['Leia keskpunkt ja raadius.', 1, '(2;-1); 5', r`$(2;-1)$, $r=5$`],
          [r`Näita, et punkt $P(5;3)$ on ringjoonel.`, 1, '', r`$(5-2)^2+(3+1)^2=9+16=25$ ✓`],
          [r`Koosta ringjoone puutuja võrrand punktis $P$.`, 3, '3x+4y-27=0|y=-0,75x+6,75', r`Raadiuse vektor $(3;4)$ on puutujaga risti: $3(x-5)+4(y-3)=0$, $3x+4y-27=0$.`, 5],
        ] },
        { title: r`Leia ringjoone $x^2+y^2=10$ ja sirge $y=x+2$ lõikepunktid.`, parts: [
          ['', 3, '(1;3); (-3;-1)', r`$x^2+(x+2)^2=10$, $x^2+2x-3=0$, $x=1$ või $x=-3$: $(1;3)$ ja $(-3;-1)$.`, 5],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Kolmnurga tipud on $A(-2;1)$, $B(4;-1)$ ja $C(0;7)$.`, grid: { xmin: -3, xmax: 6, ymin: -2, ymax: 8, step: 1, blank: true }, parts: [
        [r`Näita, et nurk $A$ on täisnurk.`, 2, '', r`$\overrightarrow{AB}=(6;-2)$, $\overrightarrow{AC}=(2;6)$, $\overrightarrow{AB}\cdot\overrightarrow{AC}=12-12=0$.`, 3],
        [r`Koosta hüpotenuusi $BC$ sirge võrrand.`, 2, 'y=-2x+7|-2x+7|2x+y-7=0', r`$k=\dfrac{7-(-1)}{0-4}=-2$; $y=-2x+7$.`, 3],
        ['Koosta kolmnurga ümberringjoone võrrand.', 3, '(x-2)^2+(y-3)^2=20|(x-2)²+(y-3)²=20', r`Täisnurkse kolmnurga ümberringjoone keskpunkt on hüpotenuusi keskpunkt $(2;3)$, $r=\dfrac{|BC|}2=\dfrac{\sqrt{80}}2=\sqrt{20}$: $(x-2)^2+(y-3)^2=20$.`, 4],
        ['Leia kolmnurga pindala.', 1, '20', r`$\dfrac12|AB|\cdot|AC|=\dfrac12\sqrt{40}\cdot\sqrt{40}=20$`, 2],
        [r`Leia tipust $A$ tõmmatud kõrguse pikkus.`, 2, '4,47|2√5', r`$h=\dfrac{2S}{|BC|}=\dfrac{40}{\sqrt{80}}=2\sqrt5\approx4{,}47$`, 3],
      ] },
      self: ['Arvutan vektori pikkuse ja skalaarkorrutise.', 'Koostan sirge ja ringjoone võrrandi.', 'Kasutan ristseisu tingimust.'],
    },
    {
      title: 'Sirge ja tasand ruumis',
      ru: 'Прямая и плоскость в пространстве',
      course: 'XII',
      slots: [12],
      exam: 'II osa, stereomeetria ülesande osa: punktid ja vektorid ruumis, kaugused, nurgad sirgete ja tasandite vahel.',
      can: 'Õpilane kasutab ruumivektoreid, leiab kaugusi ja nurki ning kasutab sirge ja tasandi võrrandit.',
      theory: [
        r`$|AB|=\sqrt{(x_2-x_1)^2+(y_2-y_1)^2+(z_2-z_1)^2}$, keskpunkt — koordinaatide poolsummad — *pähe*`,
        r`$\vec a\cdot\vec b=a_1b_1+a_2b_2+a_3b_3$, $\;\cos\varphi=\dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|}$ — *pähe*`,
        r`Tasand $Ax+By+Cz+D=0$, normaalvektor $\vec n=(A;B;C)$; sirge $\dfrac{x-x_0}{s_1}=\dfrac{y-y_0}{s_2}=\dfrac{z-z_0}{s_3}$ — *pähe*`,
        r`Sirge ja tasandi nurk: $\sin\varphi=\dfrac{|\vec s\cdot\vec n|}{|\vec s||\vec n|}$; sirgete nurk on alati $0^\circ\ldots90^\circ$ — *pähe*`,
      ],
      ru_hint: [
        'Всё как на плоскости, только три координаты. На листе формул этих формул нет.',
        'Угол между прямой и плоскостью — через синус (нормаль к плоскости!).',
        'Угол между прямыми берём острый: если cos < 0, возьми модуль.',
      ],
      example: {
        task: r`Antud on $A(1;2;3)$ ja $B(3;-1;9)$. Leia $|AB|$ ja sirge $AB$ ning tasandi $z=0$ vaheline nurk.`,
        steps: [
          r`$\overrightarrow{AB}=(2;-3;6)$, $|AB|=\sqrt{4+9+36}=7$.`,
          r`Tasandi $z=0$ normaal $\vec n=(0;0;1)$: $\sin\varphi=\dfrac{6}{7\cdot1}$.`,
          r`$\varphi\approx59{,}0^\circ$.`,
        ],
      },
      practice: [
        { title: r`Antud on $A(2;-1;3)$ ja $B(4;1;2)$.`, parts: [
          [r`$\overrightarrow{AB}$`, 1, '(2;2;-1)', r`$(4-2;\,1+1;\,2-3)=(2;2;-1)$`],
          [r`$|AB|$`, 1, '3', r`$\sqrt{4+4+1}=3$`],
          [r`Lõigu $AB$ keskpunkt`, 1, '(3;0;2,5)', r`$\left(3;0;\frac52\right)$`],
        ] },
        { title: r`Antud on $\vec a=(1;2;2)$ ja $\vec b=(2;-1;2)$.`, parts: [
          [r`$\vec a\cdot\vec b$`, 1, '4', r`$2-2+4=4$`],
          ['Nurk vektorite vahel', 2, '63,61|63,6', r`$\cos\varphi=\dfrac4{3\cdot3}$, $\varphi\approx63{,}61^\circ$`],
          [r`Leia $m$, mille korral $\vec c=(m;1;-1)\perp\vec a$.`, 1, '0', r`$m+2-2=0$, $m=0$`],
        ] },
        { title: r`Tasand $2x-y+2z-6=0$.`, parts: [
          ['Kirjuta tasandi normaalvektor.', 1, '(2;-1;2)', r`$\vec n=(2;-1;2)$`],
          [r`Näita, et punkt $P(1;2;3)$ on tasandil.`, 1, '', r`$2-2+6-6=0$ ✓`],
          ['Leia tasandi ja x-telje lõikepunkt.', 1, '(3;0;0)', r`$y=z=0$: $2x=6$, $x=3$`],
        ] },
        { title: r`Leia nurk sirge sihivektoriga $\vec s=(1;0;0)$ ja tasandi $x+y+z=0$ vahel.`, parts: [
          ['', 3, '35,26|35,3', r`$\vec n=(1;1;1)$: $\sin\varphi=\dfrac{1}{1\cdot\sqrt3}$, $\varphi\approx35{,}26^\circ$`, 4],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: r`Risttahuka $ABCDEFGH$ tipud on $A(0;0;0)$, $B(6;0;0)$, $D(0;4;0)$ ja $E(0;0;3)$ (ülemine tahk $EFGH$ asub põhja $ABCD$ kohal).`,
        figure: { kind: 'solid', solid: 'cuboid', names: 'A B C D E F G H', aLen: 6, bLen: 4, hLen: 3, a: 'AB = 6', b: 'BC = 4', H: 'AE = 3', d: 'AG', triangle: 'd' }, parts: [
          [r`Kirjuta tipu $G$ koordinaadid.`, 1, '(6;4;3)', r`$G$ on $C(6;4;0)$ kohal: $G(6;4;3)$.`, 1],
          [r`Leia ruumidiagonaali $AG$ pikkus.`, 2, '7,81|√61', r`$\sqrt{36+16+9}=\sqrt{61}\approx7{,}81$`, 2],
          [r`Leia ruumidiagonaali $AG$ ja põhitasandi $ABCD$ vaheline nurk.`, 3, '22,59|22,6', r`Põhitasandi normaal $(0;0;1)$: $\sin\varphi=\dfrac{3}{\sqrt{61}}$, $\varphi\approx22{,}59^\circ$.`, 4],
          [r`Leia ruumidiagonaalide $AG$ ja $BH$ vaheline nurk.`, 4, '79,61|79,6', r`$H(0;4;3)$, $\overrightarrow{AG}=(6;4;3)$, $\overrightarrow{BH}=(-6;4;3)$; $\cos\varphi=\dfrac{|-36+16+9|}{61}=\dfrac{11}{61}$, $\varphi\approx79{,}61^\circ$.`, 5],
        ] },
      self: ['Leian vektori ja kauguse ruumis.', 'Leian nurga vektorite või sirgete vahel.', 'Kasutan tasandi normaalvektorit.'],
    },
    {
      title: 'Kolmnurk ja planimeetria',
      ru: 'Треугольник и планиметрия',
      course: 'III, IV, XI',
      slots: [7],
      exam: 'I osa, 10-punktiline ülesanne: kolmnurga lahendamine (koosinus- ja siinusteoreem) elulises olukorras, kõrgus, pindala.',
      can: 'Õpilane lahendab mis tahes kolmnurga, kasutab täisnurkse kolmnurga meetrilisi seoseid ja ringi omadusi.',
      theory: [
        r`Koosinusteoreem $c^2=a^2+b^2-2ab\cos\gamma$; siinusteoreem $\dfrac a{\sin\alpha}=\dfrac b{\sin\beta}=\dfrac c{\sin\gamma}=2R$ — *pähe*`,
        r`$S=\dfrac12ab\sin\gamma$, $\;S=\sqrt{p(p-a)(p-b)(p-c)}$ — *pähe*`,
        r`Täisnurkne kolmnurk: $h^2=a_cb_c$, $\;a^2=c\cdot a_c$, $\;h=\dfrac{ab}c$ — *pähe*`,
        r`Ring: kaugus kõõlust $d=\sqrt{r^2-\left(\frac{k}2\right)^2}$; segment = sektor − kolmnurk — *pähe*; trigonomeetria seosed — *valemilehel*`,
      ],
      ru_hint: [
        'Теоремы синусов и косинусов на листе формул НЕТ — только тригонометрические тождества.',
        'Две стороны и угол между ними → теорема косинусов; сторона и два угла → теорема синусов.',
        'Сделай чертёж и подпиши данные — за дополнение чертежа дают балл.',
      ],
      example: {
        task: r`Kolmnurgas $a=5$, $b=7$ ja $\gamma=60^\circ$. Leia külg $c$ ja pindala.`,
        steps: [
          r`$c^2=25+49-2\cdot5\cdot7\cdot\cos60^\circ=39$, $c\approx6{,}24$.`,
          r`$S=\dfrac12\cdot5\cdot7\cdot\sin60^\circ\approx15{,}16$.`,
        ],
        figure: { kind: 'triangle', caption: 'Koosinusteoreem: leia külg $c$.', names: 'A B C', a: '5', b: '7', gamma: '60', sideA: 'a = 5', sideB: 'b = 7', sideC: 'c = ?', angleC: 'γ = 60°' },
      },
      practice: [
        { title: 'Täisnurkse kolmnurga kaatetid on 6 ja 8.', parts: [
          ['Hüpotenuus', 1, '10', r`$\sqrt{36+64}=10$`],
          ['Kõrgus hüpotenuusile', 1, '4,8', r`$h=\dfrac{6\cdot8}{10}=4{,}8$`],
          ['Kaateti 6 projektsioon hüpotenuusil', 1, '3,6', r`$a_c=\dfrac{6^2}{10}=3{,}6$`],
        ] },
        { title: r`Kolmnurga küljed on $a=8$, $b=11$ ja $c=13$.`, parts: [
          [r`Suurim nurk $\gamma$`, 2, '84,78|84,8', r`$\cos\gamma=\dfrac{64+121-169}{176}=\dfrac{16}{176}$, $\gamma\approx84{,}78^\circ$`],
          ['Pindala', 2, '43,82', r`Heron: $p=16$, $S=\sqrt{16\cdot8\cdot5\cdot3}=\sqrt{1920}\approx43{,}82$`],
          ['Ümberringjoone raadius', 1, '6,53', r`$R=\dfrac{c}{2\sin\gamma}\approx6{,}53$`],
        ] },
        { title: r`Kolmnurgas $\alpha=40^\circ$, $\beta=65^\circ$ ja $c=12$.`, parts: [
          [r`Leia külg $a$.`, 2, '7,99', r`$\gamma=75^\circ$; $a=\dfrac{12\sin40^\circ}{\sin75^\circ}\approx7{,}99$`],
          [r`Leia külg $b$.`, 1, '11,26', r`$b=\dfrac{12\sin65^\circ}{\sin75^\circ}\approx11{,}26$`],
        ] },
        { title: 'Ringi raadius on 10 cm ja kõõl AB on 12 cm.', parts: [
          ['Kõõlu kaugus keskpunktist', 1, '8', r`$\sqrt{100-36}=8$ cm`],
          ['Kesknurk AOB', 1, '73,74', r`$\sin\frac\varphi2=\frac6{10}$, $\varphi\approx73{,}74^\circ$`],
          ['Väiksema segmendi pindala', 3, '16,35', r`Sektor $100\pi\cdot\dfrac{73{,}74}{360}\approx64{,}35$, kolmnurk $\dfrac12\cdot100\cdot\sin73{,}74^\circ=48$; segment $\approx16{,}35$ cm²`, 5],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Kaks sirget teed lähtuvad ristmikust O nurga 72° all. Ühe tee ääres on ristmikust 4,2 km kaugusel küla A, teise tee ääres 6,5 km kaugusel küla B.',
        figure: { kind: 'triangle', caption: 'Ristmik O ja külad A, B.', names: 'O A B', b: '6.5', c: '4.2', alpha: '72', sideB: 'OB = 6,5 km', sideC: 'OA = 4,2 km', sideA: 'AB = ?', angleA: '72°' }, parts: [
          ['Leia külade A ja B vaheline kaugus linnulennult.', 3, '6,56', r`$AB^2=4{,}2^2+6{,}5^2-2\cdot4{,}2\cdot6{,}5\cos72^\circ\approx43{,}02$, $AB\approx6{,}56$ km.`, 4],
          ['Leia nurk OAB.', 3, '70,48|70,5', r`$\cos\angle A=\dfrac{4{,}2^2+6{,}56^2-6{,}5^2}{2\cdot4{,}2\cdot6{,}56}\approx0{,}334$, $\angle A\approx70{,}48^\circ$.`, 4],
          ['Külast A ehitatakse lühim tee teeni OB. Kui pikk on see tee?', 2, '3,99', r`Lühim tee on risti teega OB: $h=4{,}2\sin72^\circ\approx3{,}99$ km.`, 3],
          ['Leia kolmnurga OAB pindala.', 2, '12,98', r`$S=\dfrac12\cdot4{,}2\cdot6{,}5\cdot\sin72^\circ\approx12{,}98$ km²`, 2],
        ] },
      self: ['Valin koosinus- või siinusteoreemi.', 'Arvutan kolmnurga pindala.', 'Kasutan ringi ja täisnurkse kolmnurga seoseid.'],
    },
    {
      title: 'Stereomeetria: kehad ja lõiked',
      ru: 'Стереометрия: тела и сечения',
      course: 'XIII',
      slots: [12],
      exam: 'II osa, 10-punktiline ülesanne: prisma, püramiid või pöördkeha — pikkused, nurgad, lõike pindala, pindala ja ruumala.',
      can: 'Õpilane arvutab hulktahukate ja pöördkehade pindala ja ruumala, nende lõigete pindala ning nurgad sirgete ja tasandite vahel.',
      theory: [
        r`Prisma $V=S_pH$; püramiid $V=\dfrac13S_pH$; tüvipüramiid $V=\dfrac H3\left(S_1+S_2+\sqrt{S_1S_2}\right)$ — *pähe*`,
        r`Silinder $V=\pi r^2H$, $S_k=2\pi rH$; koonus $V=\dfrac13\pi r^2H$, $S_k=\pi rs$; kera $V=\dfrac43\pi r^3$, $S=4\pi r^2$ — *pähe*`,
        r`Sirge ja tasandi nurk = nurk sirge ja tema projektsiooni vahel; kahetahuline nurk — apoteemi ja põhja vahel — *pähe*`,
        r`Kera lõige: $r_l=\sqrt{R^2-d^2}$ — *pähe*; trigonomeetria seosed — *valemilehel*`,
      ],
      ru_hint: [
        'Формул объёмов и площадей на листе формул нет — учи наизусть.',
        'Ищи прямоугольный треугольник: высота, апофема, половина диагонали основания, боковое ребро.',
        'Угол боковой грани с основанием — между апофемой и её проекцией (половиной стороны основания).',
      ],
      example: {
        task: 'Korrapärase nelinurkse püramiidi põhiserv on 6 ja kõrgus 4. Leia apoteem, külgpindala, ruumala ja külgserva ning põhja vaheline nurk.',
        steps: [
          r`Apoteem $k=\sqrt{4^2+3^2}=5$; $S_k=4\cdot\dfrac12\cdot6\cdot5=60$.`,
          r`$V=\dfrac13\cdot36\cdot4=48$.`,
          r`Pool põhja diagonaali $3\sqrt2$: $\tan\varphi=\dfrac{4}{3\sqrt2}$, $\varphi\approx43{,}31^\circ$.`,
        ],
        figure: { kind: 'solid', solid: 'pyramid', caption: 'Korrapärane nelinurkne püramiid.', names: 'A B C D S O', a: 'a = 6', H: 'H = 4', k: 'k = ?', triangle: 'k' },
      },
      practice: [
        { title: 'Korrapärase kolmnurkse prisma põhiserv on 6 cm ja kõrgus 10 cm.', parts: [
          ['Põhja pindala', 1, '15,59|9√3', r`$\dfrac{\sqrt3}{4}\cdot36=9\sqrt3\approx15{,}59$ cm²`],
          ['Ruumala', 1, '155,88|90√3', r`$9\sqrt3\cdot10\approx155{,}88$ cm³`],
          ['Täispindala', 2, '211,18', r`$2\cdot9\sqrt3+3\cdot6\cdot10\approx211{,}18$ cm²`],
        ] },
        { title: 'Koonuse telglõige on võrdkülgne kolmnurk küljega 8 cm.', parts: [
          ['Kõrgus', 1, '6,93|4√3', r`$r=4$, $s=8$: $H=\sqrt{64-16}=4\sqrt3\approx6{,}93$ cm`],
          ['Ruumala', 2, '116,08', r`$\dfrac13\pi\cdot16\cdot4\sqrt3\approx116{,}08$ cm³`],
          ['Külgpindala', 1, '100,53|32π', r`$\pi\cdot4\cdot8=32\pi\approx100{,}53$ cm²`],
        ] },
        { title: 'Kera raadiusega 13 cm lõigatakse tasandiga, mis on keskpunktist 5 cm kaugusel.', parts: [
          ['Lõikeringi raadius', 1, '12', r`$\sqrt{169-25}=12$ cm`],
          ['Lõike pindala', 1, '452,39|144π', r`$144\pi\approx452{,}39$ cm²`],
        ] },
        { title: 'Risttahuka mõõtmed on 3, 4 ja 12.', parts: [
          ['Ruumidiagonaal', 1, '13', r`$\sqrt{9+16+144}=13$`],
          ['Ruumidiagonaali ja põhja vaheline nurk', 2, '67,38|67,4', r`$\sin\varphi=\dfrac{12}{13}$, $\varphi\approx67{,}38^\circ$`],
          ['Diagonaallõike pindala', 1, '60', r`Põhja diagonaal $5$: $5\cdot12=60$`],
        ] },
      ],
      examTask: { title: 'Eksamiülesanne (10 punkti)', context: 'Korrapärase nelinurkse püramiidi SABCD põhiserv on 8 cm ja külgserv 9 cm.',
        figure: { kind: 'solid', solid: 'pyramid', caption: 'Püramiid SABCD.', names: 'A B C D S O', a: 'a = 8', s: 's = 9', H: 'H = ?', triangle: 's' }, parts: [
          ['Leia püramiidi kõrgus.', 2, '7', r`Pool põhja diagonaali $4\sqrt2$: $H=\sqrt{81-32}=7$ cm.`, 3],
          ['Leia püramiidi ruumala.', 2, '149,33|448/3', r`$V=\dfrac13\cdot64\cdot7=\dfrac{448}3\approx149{,}33$ cm³`, 2],
          ['Leia külgtahu ja põhja vaheline nurk.', 3, '60,26|60,3', r`Apoteemi projektsioon on pool põhiservast, 4 cm: $\tan\varphi=\dfrac74$, $\varphi\approx60{,}26^\circ$.`, 4],
          ['Leia püramiidi külgpindala.', 3, '129|16√65', r`Apoteem $k=\sqrt{81-16}=\sqrt{65}$; $S_k=4\cdot\dfrac12\cdot8\cdot\sqrt{65}=16\sqrt{65}\approx129$ cm².`, 4],
        ] },
      self: ['Leian kõrguse või apoteemi täisnurksest kolmnurgast.', 'Arvutan pindala ja ruumala.', 'Leian nurga tahu ja põhja vahel.'],
    },
  ],
};
