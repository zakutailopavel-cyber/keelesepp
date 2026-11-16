// Matemaatika lai riigieksam: three full mock exams (ml12-021…023) in the 2027 format (docs/MATH_RIIGIEKSAM_LAI.md):
//   I osa 120 min — tasks 1–4 of 5 p and tasks 5–7 of 10 p; II osa 150 min — tasks 8–12 of 10 p; total 100 p.
// The task positions follow the lai paper: 1 probability, 2 a word problem with a system, 3 simplification, 4 inequality,
// 5 function investigation, 6 sequences, 7 triangle, 8 trig equation in radians, 9 tangent and area, 10 analytic
// geometry, 11 logarithms / models, 12 stereometry. Every task is our own (Harno past papers and the 2026 marking scheme
// are a format reference only). Same part format as kitsas12mocks.js: [text, points, answer, solution, rows?] —
// answer '' = the teacher judges it; several right forms are separated by |, several answers by ;
// (engine/mathExpr.js sameMathAnswer). `topic` is shown only on the self-analysis sheet. `grid` is a blank graph grid
// after the task (drawing parts), `figure` a „Geomeetriline joonis” (geofigure) before it (triangle and solid tasks).
const r = String.raw;

const CAN = 'Õpilane lahendab laia matemaatika riigieksami täisvariandi ettenähtud ajaga ja kirjutab lahenduskäigu samm-sammult.';

export const LAI_12_MOCKS = [
  {
    title: 'Proovieksam 1',
    ru: 'Пробный экзамен 1',
    can: CAN,
    part1: [
      { topic: 'Tõenäosus (kombinatsioonid)', context: 'Karbis on 5 punast, 4 sinist ja 3 rohelist palli. Karbist võetakse juhuslikult korraga 3 palli.', parts: [
        ['Leia tõenäosus, et kõik kolm palli on sama värvi.', 2, '3/44|0,068|0,07', r`Kõiki võimalusi on $C_{12}^3=220$. Sama värv: $C_5^3+C_4^3+C_3^3=10+4+1=15$. $P=\dfrac{15}{220}=\dfrac{3}{44}\approx0{,}068$.`, 3],
        ['Leia tõenäosus, et kõik kolm palli on eri värvi.', 2, '3/11|0,273|0,27', r`Soodsaid võimalusi $5\cdot4\cdot3=60$: $P=\dfrac{60}{220}=\dfrac{3}{11}\approx0{,}273$.`, 3],
        ['Leia tõenäosus, et võetud pallide hulgas on vähemalt üks punane pall.', 1, '37/44|0,841|0,84', r`Vastandsündmus „ühtki punast ei ole”: $C_7^3=35$. $P=1-\dfrac{35}{220}=\dfrac{185}{220}=\dfrac{37}{44}\approx0{,}841$.`, 2],
      ] },
      { topic: 'Tekstülesanne võrrandisüsteemiga', context: 'Apteeker segab 20-protsendilist ja 50-protsendilist lahust, et saada 600 g 30-protsendilist lahust.', parts: [
        ['Tähista tundmatud ja koosta võrrandisüsteem.', 2, '', r`$x$ — 20% lahuse mass, $y$ — 50% lahuse mass (g): $\begin{cases}x+y=600\\0{,}2x+0{,}5y=0{,}3\cdot600=180\end{cases}$`, 3],
        ['Mitu grammi kumbagi lahust on vaja?', 3, '400; 200', r`$y=600-x$: $0{,}2x+0{,}5(600-x)=180$, $300-0{,}3x=180$, $x=400$, $y=200$. Vaja on $400$ g 20% lahust ja $200$ g 50% lahust.`, 4],
      ] },
      { topic: 'Avaldise lihtsustamine', parts: [
        [r`Lihtsusta avaldis $\left(\dfrac{\sqrt a}{\sqrt a-\sqrt b}-\dfrac{\sqrt b}{\sqrt a+\sqrt b}\right)\cdot\dfrac{a-b}{a+b}$.`, 3, '1', r`Ühine nimetaja $(\sqrt a-\sqrt b)(\sqrt a+\sqrt b)=a-b$: $\dfrac{\sqrt a(\sqrt a+\sqrt b)-\sqrt b(\sqrt a-\sqrt b)}{a-b}=\dfrac{a+\sqrt{ab}-\sqrt{ab}+b}{a-b}=\dfrac{a+b}{a-b}$. Korrutis: $\dfrac{a+b}{a-b}\cdot\dfrac{a-b}{a+b}=1$ (kui $a\ge0$, $b\ge0$, $a\ne b$).`, 5],
        [r`Lihtsusta avaldis $\dfrac{x^{\frac32}-8}{x^{\frac12}-2}$ ja arvuta selle väärtus, kui $x=9$.`, 2, '19', r`$x^{\frac32}-8=\left(\sqrt x\right)^3-2^3=(\sqrt x-2)(x+2\sqrt x+4)$, seega avaldis on $x+2\sqrt x+4$. Kui $x=9$: $9+6+4=19$.`, 3],
      ] },
      { topic: 'Ratsionaalvõrratus', parts: [
        [r`Lahenda võrratus $\dfrac{x^2-4x-5}{x+2}\le0$.`, 3, 'x<-2; -1<=x<=5|x<-2; -1≤x≤5|(-∞;-2)∪[-1;5]', r`Lugeja: $x^2-4x-5=(x+1)(x-5)=0$, $x=-1$, $x=5$; nimetaja nullkoht $x=-2$ ei kuulu lahendisse. Intervallmeetod: $x<-2$: $-$; $-2<x<-1$: $+$; $-1<x<5$: $-$; $x>5$: $+$. Vastus: $x\in(-\infty;-2)\cup[-1;5]$.`, 5],
        [r`Mitu täisarvu lõigult $[-5;5]$ rahuldab seda võrratust?`, 2, '10', r`$-5,-4,-3$ (kus $x<-2$) ja $-1,0,1,2,3,4,5$: kokku $3+7=10$.`, 2],
      ] },
      { topic: 'Funktsiooni uurimine (eksponentfunktsioon)', context: r`Antud on funktsioon $f(x)=(x^2-3)e^x$.`, parts: [
        ['Leia funktsiooni nullkohad.', 1, '1,73; -1,73|√3; -√3', r`$e^x>0$, seega $x^2-3=0$, $x=\pm\sqrt3\approx\pm1{,}73$.`, 2],
        [r`Leia $f'(x)$ ja kirjuta see tegurdatud kujul.`, 2, '(x+3)(x-1)e^x|(x^2+2x-3)e^x', r`Korrutise tuletis: $f'(x)=2x\cdot e^x+(x^2-3)e^x=(x^2+2x-3)e^x=(x+3)(x-1)e^x$.`, 3],
        ['Leia ekstreemumkohad ja määra, kumb on maksimum- ja kumb miinimumkoht.', 3, '-3; 1', r`$f'(x)=0\Rightarrow x=-3$ või $x=1$ ($e^x\ne0$). Märk: $x<-3$: $+$; $-3<x<1$: $-$; $x>1$: $+$. $x=-3$ on maksimumkoht, $f(-3)=6e^{-3}\approx0{,}30$; $x=1$ on miinimumkoht, $f(1)=-2e\approx-5{,}44$.`, 4],
        ['Kirjuta funktsiooni kasvamis- ja kahanemisvahemikud.', 2, '', r`Kasvab: $x<-3$ ja $x>1$; kahaneb: $-3<x<1$.`, 2],
        [r`Leia funktsiooni suurim ja vähim väärtus lõigul $[-4;2]$.`, 2, '7,39; -5,44|e^2; -2e', r`Kandidaadid on otspunktid ja ekstreemumkohad: $f(-4)=13e^{-4}\approx0{,}24$, $f(-3)=6e^{-3}\approx0{,}30$, $f(1)=-2e\approx-5{,}44$, $f(2)=e^2\approx7{,}39$. Suurim väärtus $e^2\approx7{,}39$, vähim $-2e\approx-5{,}44$.`, 3],
      ] },
      { topic: 'Aritmeetiline ja geomeetriline jada', context: 'Kolm arvu, mille summa on 15, moodustavad aritmeetilise jada. Kui neist esimesele ja teisele liita 1 ning kolmandale 4, saadakse geomeetrilise jada kolm järjestikust liiget.', parts: [
        [r`Leia aritmeetilise jada vahe $d$ (kõik võimalused).`, 4, '3; -6', r`Arvud on $5-d$, $5$, $5+d$ ($3\cdot5=15$). Geomeetriline jada: $6-d$, $6$, $9+d$, seega $6^2=(6-d)(9+d)$, $36=54-3d-d^2$, $d^2+3d-18=0$, $d=3$ või $d=-6$.`, 5],
        [r`Kasvava aritmeetilise jada korral leia geomeetrilise jada tegur $q$ ja selle jada 8. liige.`, 3, '2; 384', r`$d=3$: arvud $2, 5, 8$; geomeetriline jada $3, 6, 12$, $q=2$. $b_8=3\cdot2^7=384$.`, 3],
        [r`Kui $d=-6$, on geomeetriline jada $12, 6, 3, \dots$ Leia selle hääbuva geomeetrilise jada kõigi liikmete summa $S$.`, 1, '24', r`$q=\dfrac12$: $S=\dfrac{b_1}{1-q}=\dfrac{12}{1-\frac12}=24$.`, 2],
        [r`Vähemalt mitme esimese liikme summa erineb summast $S$ vähem kui $0{,}01$ võrra?`, 2, '12', r`$S-S_n=\dfrac{b_1q^n}{1-q}=24\cdot\left(\dfrac12\right)^n<0{,}01$, $2^n>2400$. $2^{11}=2048$, $2^{12}=4096$: vaja on vähemalt $12$ liiget.`, 3],
      ] },
      { topic: 'Kolmnurk (siinus- ja koosinusteoreem)', context: 'Järve kaldal on punktid A ja B, mille vahekaugus on 240 m. Poi C asub järvel; nurk CAB on 52° ja nurk CBA on 71°.',
        figure: { kind: 'triangle', caption: 'Kaldapunktid A, B ja poi C.', names: 'A B C', c: '240', alpha: '52', beta: '71', sideC: 'AB = 240 m', sideB: 'AC = ?', angleA: '52°', angleB: '71°' }, parts: [
          ['Leia poi kaugus punktist A.', 3, '270,58|270,6', r`$\angle C=180^\circ-52^\circ-71^\circ=57^\circ$. Siinusteoreem: $AC=\dfrac{240\sin71^\circ}{\sin57^\circ}\approx270{,}58$ m.`, 4],
          ['Leia poi kaugus punktist B.', 2, '225,5|225,50', r`$BC=\dfrac{240\sin52^\circ}{\sin57^\circ}\approx225{,}50$ m.`, 3],
          ['Kui kaugel on poi kaldast (sirgest AB)?', 2, '213,22|213,2', r`Kõrgus tipust $C$: $h=AC\cdot\sin52^\circ\approx270{,}58\cdot0{,}7880\approx213{,}22$ m.`, 3],
          ['Ujuja ujub poist lõigu AB keskpunkti M. Kui pikk on tema teekond?', 3, '218,25|218,2', r`$AM=120$ m. Koosinusteoreem kolmnurgas $AMC$: $CM^2=AC^2+AM^2-2\cdot AC\cdot AM\cos52^\circ\approx73\,211{,}59+14\,400-39\,980{,}03=47\,631{,}56$, $CM\approx218{,}25$ m.`, 4],
        ] },
    ],
    part2: [
      { topic: 'Trigonomeetriline võrrand radiaanides', context: r`Antud on funktsioon $f(x)=2\cos^2x+3\sin x-3$.`, parts: [
        [r`Näita, et võrrandi $f(x)=0$ saab kirjutada kujul $2\sin^2x-3\sin x+1=0$.`, 2, '', r`$\cos^2x=1-\sin^2x$: $2-2\sin^2x+3\sin x-3=0$, $-2\sin^2x+3\sin x-1=0$; korrutame $-1$-ga: $2\sin^2x-3\sin x+1=0$.`, 3],
        [r`Lahenda võrrand $f(x)=0$ lõigul $[0;2\pi]$.`, 4, 'π/6; π/2; 5π/6|0,52; 1,57; 2,62', r`Asendus $t=\sin x$: $2t^2-3t+1=0$, $t=1$ või $t=\dfrac12$. $\sin x=1$: $x=\dfrac\pi2$; $\sin x=\dfrac12$: $x=\dfrac\pi6$ või $x=\pi-\dfrac\pi6=\dfrac{5\pi}6$.`, 5],
        [r`Leia $f'(x)$ ja lahenda võrrand $f'(x)=0$ lõigul $[0;2\pi]$ (vastused kahe kümnendkohaga).`, 4, '0,85; 1,57; 2,29; 4,71', r`$f'(x)=2\cdot2\cos x\cdot(-\sin x)+3\cos x=\cos x\,(3-4\sin x)$. $\cos x=0$: $x=\dfrac\pi2\approx1{,}57$, $x=\dfrac{3\pi}2\approx4{,}71$. $\sin x=\dfrac34$: $x=\arcsin0{,}75\approx0{,}85$, $x=\pi-0{,}848\approx2{,}29$.`, 5],
      ] },
      { topic: 'Puutuja ja pindala (eksponentfunktsioon)', context: r`Antud on funktsioon $f(x)=e^x$.`, grid: { xmin: -2, xmax: 3, ymin: -1, ymax: 8, step: 1, blank: true }, parts: [
        [r`Koosta funktsiooni graafiku puutuja võrrand kohal $x=1$.`, 3, 'y=ex|y=2,72x', r`$f(1)=e$, $f'(x)=e^x$, $f'(1)=e$. $y-e=e(x-1)$, seega $y=ex$ (puutuja läbib koordinaatide alguspunkti).`, 3],
        [r`Joonesta graafik ja puutuja ühes teljestikus ning viiruta kujund, mida piiravad graafik, puutuja ja $y$-telg.`, 2, '', r`Graafik: $(-1;0{,}37)$, $(0;1)$, $(1;2{,}72)$, $(2;7{,}39)$; puutuja läbib punkte $(0;0)$ ja $(1;e)$. Kujund on lõigul $0\le x\le1$ graafiku ja puutuja vahel.`, 0],
        ['Arvuta selle kujundi pindala.', 3, '0,36|e/2-1', r`Graafik on puutujast kõrgemal: $S=\displaystyle\int_0^1(e^x-ex)\,dx=\left[e^x-\dfrac{ex^2}{2}\right]_0^1=\left(e-\dfrac e2\right)-1=\dfrac e2-1\approx0{,}36$.`, 4],
        [r`Koosta graafiku selle puutuja võrrand, mis on paralleelne sirgega $y=2x+5$.`, 2, 'y=2x+0,61|y=2x+2-2ln2', r`Tõus $e^x=2$, $x=\ln2$, $f(\ln2)=2$. $y-2=2(x-\ln2)$, $y=2x+2-2\ln2\approx2x+0{,}61$.`, 3],
      ] },
      { topic: 'Ringjoon ja sirge (analüütiline geomeetria)', context: r`Ringjoon läbib punkte $A(6;4)$ ja $B(-1;-3)$ ning selle keskpunkt asub sirgel $y=2x-3$.`, parts: [
        [r`Koosta lõigu $AB$ keskristsirge võrrand.`, 3, 'y=-x+3|y=3-x|x+y-3=0', r`Keskpunkt $M\left(\dfrac{6-1}{2};\dfrac{4-3}{2}\right)=(2{,}5;0{,}5)$. $\overrightarrow{AB}=(-7;-7)$, tõus $1$; ristsirge tõus $-1$: $y-0{,}5=-(x-2{,}5)$, $y=-x+3$.`, 4],
        [r`Leia ringjoone keskpunkt $K$ ja raadius.`, 2, '(2; 1); 5', r`Keskpunkt on keskristsirgel ja sirgel $y=2x-3$: $-x+3=2x-3$, $x=2$, $y=1$, $K(2;1)$. $r=|KA|=\sqrt{4^2+3^2}=5$ (kontroll: $|KB|=\sqrt{3^2+4^2}=5$).`, 3],
        ['Koosta ringjoone võrrand.', 2, '(x-2)^2+(y-1)^2=25|(x-2)²+(y-1)²=25|x^2+y^2-4x-2y-20=0', r`$(x-2)^2+(y-1)^2=25$, ehk $x^2+y^2-4x-2y-20=0$.`, 2],
        [r`Koosta ringjoone puutuja võrrand punktis $A$.`, 3, '4x+3y-36=0|y=-4x/3+12|y=12-4x/3', r`Puutuja on risti raadiusega $\overrightarrow{KA}=(4;3)$: $4(x-6)+3(y-4)=0$, $4x+3y-36=0$, ehk $y=-\dfrac43x+12$.`, 4],
      ] },
      { topic: 'Eksponentmudel ja logaritmvõrrand', context: r`Ravimi kontsentratsioon veres $t$ tundi pärast süsti on $C(t)=12e^{-0{,}2t}$ mg/l.`, parts: [
        ['Leia kontsentratsioon 5 tunni pärast.', 2, '4,41', r`$C(5)=12e^{-1}\approx4{,}41$ mg/l.`, 2],
        ['Ravim toimib, kuni kontsentratsioon on vähemalt 2 mg/l. Kui kaua ravim toimib?', 3, '8,96|5ln6', r`$12e^{-0{,}2t}\ge2$, $e^{-0{,}2t}\ge\dfrac16$, $-0{,}2t\ge-\ln6$, $t\le5\ln6\approx8{,}96$ h.`, 4],
        ['Mitme tunniga väheneb kontsentratsioon poole võrra (poolestusaeg)?', 2, '3,47|5ln2', r`$e^{-0{,}2t}=\dfrac12$, $t=\dfrac{\ln2}{0{,}2}=5\ln2\approx3{,}47$ h; see ei sõltu algväärtusest.`, 3],
        [r`Leia $C'(5)$ ja selgita selle tähendust.`, 3, '-0,88|-0,883', r`$C'(t)=12\cdot(-0{,}2)e^{-0{,}2t}=-2{,}4e^{-0{,}2t}$, $C'(5)=-2{,}4e^{-1}\approx-0{,}88$: 5 tunni pärast väheneb kontsentratsioon kiirusega umbes $0{,}88$ mg/l tunnis.`, 4],
      ] },
      { topic: 'Stereomeetria (koonus ja kera)', context: 'Koonuse moodustaja on 13 cm ja põhja raadius 5 cm.',
        figure: { kind: 'solid', solid: 'cone', caption: 'Koonus: kõrgus, raadius ja moodustaja.', names: 'S', r: 'r = 5', s: 's = 13', H: 'H = ?', triangle: 's' }, parts: [
          ['Leia koonuse kõrgus.', 2, '12', r`$H=\sqrt{13^2-5^2}=12$ cm.`, 2],
          ['Leia moodustaja ja põhja vaheline nurk.', 2, '67,38|67,4', r`$\cos\varphi=\dfrac{5}{13}$, $\varphi\approx67{,}38^\circ$.`, 2],
          ['Leia koonuse ruumala.', 2, '314,16|100π', r`$V=\dfrac13\pi r^2H=\dfrac13\pi\cdot25\cdot12=100\pi\approx314{,}16$ cm³.`, 2],
          ['Koonuse külgpind lõigatakse mööda moodustajat lahti ja laotatakse tasandile. Leia saadud ringi sektori kesknurk.', 2, '138,46|138,5', r`Sektori kaare pikkus on põhja ümbermõõt: $\dfrac{\alpha}{360^\circ}\cdot2\pi\cdot13=2\pi\cdot5$, $\alpha=\dfrac{5}{13}\cdot360^\circ\approx138{,}46^\circ$.`, 3],
          ['Koonusesse on joonestatud kera (see puutub koonuse põhja ja külgpinda). Leia kera raadius.', 2, '3,33|10/3', r`Telglõige on võrdhaarne kolmnurk külgedega $13$, $13$, $10$: $S=\dfrac12\cdot10\cdot12=60$, poolümbermõõt $p=18$. Kera raadius on telglõike siseringjoone raadius: $\rho=\dfrac{S}{p}=\dfrac{60}{18}=\dfrac{10}{3}\approx3{,}33$ cm.`, 4],
        ] },
    ],
    self: ['Lõpetasin I osa 120 minutiga.', 'Lõpetasin II osa 150 minutiga.', 'Kirjutasin igas ülesandes lahenduskäigu.', 'Leidsin trigonomeetrilise võrrandi kõik lahendid lõigul.', 'Tean, milliseid teemasid pean kordama.'],
  },
  {
    title: 'Proovieksam 2',
    ru: 'Пробный экзамен 2',
    can: CAN,
    part1: [
      { topic: 'Tõenäosus (binoomjaotus)', context: 'Korvpallur tabab vabaviske tõenäosusega 0,7. Ta viskab 6 vabaviset; visked on sõltumatud.', parts: [
        ['Leia tõenäosus, et ta tabab täpselt 4 korda.', 2, '0,324|0,32', r`Bernoulli valem: $P(X=4)=C_6^4\cdot0{,}7^4\cdot0{,}3^2=15\cdot0{,}2401\cdot0{,}09\approx0{,}324$.`, 3],
        ['Leia tõenäosus, et ta tabab vähemalt 5 korda.', 2, '0,42|0,420', r`$P(X=5)=6\cdot0{,}7^5\cdot0{,}3\approx0{,}3025$, $P(X=6)=0{,}7^6\approx0{,}1176$; kokku $\approx0{,}420$.`, 3],
        ['Leia tabamuste arvu keskväärtus.', 1, '4,2', r`$E(X)=np=6\cdot0{,}7=4{,}2$.`, 1],
      ] },
      { topic: 'Tekstülesanne võrrandisüsteemiga', context: 'Paat sõidab jõel 36 km pärivoolu 2 tunniga ja sama tee vastuvoolu 3 tunniga.', parts: [
        ['Tähista paadi kiirus seisvas vees ja voolu kiirus ning koosta võrrandisüsteem.', 2, '', r`$v$ — paadi kiirus seisvas vees, $u$ — voolu kiirus (km/h): $\begin{cases}2(v+u)=36\\3(v-u)=36\end{cases}$`, 3],
        ['Leia paadi kiirus seisvas vees ja voolu kiirus.', 2, '15; 3', r`$v+u=18$, $v-u=12$; liites $2v=30$, $v=15$ km/h, $u=3$ km/h.`, 3],
        ['Mitu tundi kulub sama tee läbimiseks parvel, mis liigub vooluga?', 1, '12', r`Parve kiirus on voolu kiirus: $36:3=12$ h.`, 1],
      ] },
      { topic: 'Avaldise lihtsustamine (astmed ja logaritmid)', parts: [
        [r`Lihtsusta avaldis $\dfrac{a^{-1}-b^{-1}}{a^{-2}-b^{-2}}$.`, 3, 'ab/(a+b)', r`$a^{-1}-b^{-1}=\dfrac{b-a}{ab}$, $a^{-2}-b^{-2}=\dfrac{b^2-a^2}{a^2b^2}=\dfrac{(b-a)(b+a)}{a^2b^2}$. Jagatis: $\dfrac{b-a}{ab}\cdot\dfrac{a^2b^2}{(b-a)(b+a)}=\dfrac{ab}{a+b}$.`, 5],
        [r`Arvuta $\log_2 48-\log_2 3+\log_3\sqrt{27}$.`, 2, '5,5|11/2', r`$\log_2\dfrac{48}{3}=\log_2 16=4$; $\log_3 27^{\frac12}=\dfrac12\cdot3=1{,}5$. Kokku $5{,}5$.`, 3],
      ] },
      { topic: 'Logaritm- ja eksponentvõrratus', parts: [
        [r`Lahenda võrratus $\log_{0{,}5}(x-1)\ge-2$.`, 3, '1<x<=5|1<x≤5|(1;5]', r`Määramispiirkond $x>1$. $-2=\log_{0{,}5}4$; alus $0{,}5<1$, funktsioon kahaneb ja võrratuse märk pöördub: $x-1\le4$, $x\le5$. Vastus $1<x\le5$.`, 4],
        [r`Lahenda võrratus $4^x-3\cdot2^x-4<0$.`, 2, 'x<2|(-∞;2)', r`$t=2^x>0$: $t^2-3t-4<0$, $(t-4)(t+1)<0$, $-1<t<4$. Et $t>0$: $2^x<4=2^2$, $x<2$.`, 3],
      ] },
      { topic: 'Funktsiooni uurimine (logaritmfunktsioon)', context: r`Antud on funktsioon $f(x)=\dfrac{\ln x}{x}$.`, parts: [
        ['Leia funktsiooni määramispiirkond ja nullkoht.', 2, '1', r`Logaritm on määratud, kui $x>0$ (siis ka nimetaja $\ne0$). $\ln x=0\Rightarrow x=1$.`, 2],
        [r`Leia $f'(x)$.`, 2, '(1-ln(x))/x^2|(1-lnx)/x^2|(1-lnx)/x²', r`Jagatise tuletis: $f'(x)=\dfrac{\frac1x\cdot x-\ln x\cdot1}{x^2}=\dfrac{1-\ln x}{x^2}$.`, 3],
        ['Leia funktsiooni ekstreemumpunkt ja selle liik.', 2, '(2,72; 0,37)|(e; 1/e)', r`$f'(x)=0\Rightarrow\ln x=1$, $x=e$. Kui $0<x<e$, siis $f'(x)>0$; kui $x>e$, siis $f'(x)<0$: maksimumpunkt $\left(e;\dfrac1e\right)\approx(2{,}72;0{,}37)$.`, 3],
        ['Kirjuta funktsiooni kasvamis- ja kahanemisvahemik.', 2, '', r`Kasvab: $0<x<e$; kahaneb: $x>e$.`, 2],
        [r`Leia $f''(x)$ ja graafiku käänupunkti abstsiss.`, 2, '4,48|e^1,5|e√e', r`$f''(x)=\dfrac{-\frac1x\cdot x^2-(1-\ln x)\cdot2x}{x^4}=\dfrac{2\ln x-3}{x^3}$. $f''(x)=0\Rightarrow\ln x=1{,}5$, $x=e^{1{,}5}=e\sqrt e\approx4{,}48$; $f''$ muudab seal märki.`, 4],
      ] },
      { topic: 'Aritmeetiline ja geomeetriline jada (tekstülesanne)', context: 'Mari ja Jaan alustavad treeningut. Mõlemad jooksevad esimesel päeval 2 km. Mari jookseb igal järgmisel päeval 0,5 km rohkem kui eelmisel päeval, Jaan aga 10% rohkem kui eelmisel päeval.', parts: [
        ['Mitu kilomeetrit jookseb Mari 15. päeval?', 2, '9', r`Aritmeetiline jada $a_1=2$, $d=0{,}5$: $a_{15}=2+14\cdot0{,}5=9$ km.`, 2],
        ['Mitu kilomeetrit jookseb Mari kokku 15 päevaga?', 2, '82,5', r`$S_{15}=\dfrac{2+9}{2}\cdot15=82{,}5$ km.`, 2],
        ['Mitu kilomeetrit jookseb Jaan 15. päeval?', 2, '7,59|7,6', r`Geomeetriline jada $b_1=2$, $q=1{,}1$: $b_{15}=2\cdot1{,}1^{14}\approx7{,}59$ km.`, 2],
        ['Mitmendal päeval jookseb Jaan esimest korda rohkem kui Mari samal päeval?', 4, '19', r`Tingimus $2\cdot1{,}1^{n-1}>2+0{,}5(n-1)$. Esimestel päevadel on Mari ees (nt $n=10$: $2\cdot1{,}1^9\approx4{,}72<6{,}5$). $n=18$: $2\cdot1{,}1^{17}\approx10{,}11<10{,}5$; $n=19$: $2\cdot1{,}1^{18}\approx11{,}12>11$. Vastus: 19. päeval.`, 5],
      ] },
      { topic: 'Kolmnurk (koosinusteoreem ja kõrgus)', context: 'Kolmnurkse krundi ABC küljed AB = 85 m ja AC = 60 m moodustavad nurga 110°. Krundi kolmas külg BC piirneb teega.',
        figure: { kind: 'triangle', caption: 'Krunt ABC; tee on külje BC ääres.', names: 'A B C', b: '60', c: '85', alpha: '110', sideB: 'AC = 60 m', sideC: 'AB = 85 m', sideA: 'BC = ?', angleA: '110°', height: 'A', heightLabel: 'h' }, parts: [
          ['Leia külje BC pikkus.', 3, '119,64|119,6', r`Koosinusteoreem: $BC^2=85^2+60^2-2\cdot85\cdot60\cos110^\circ\approx7225+3600+3488{,}61=14\,313{,}61$, $BC\approx119{,}64$ m.`, 4],
          ['Leia nurk B.', 2, '28,12|28,1', r`Siinusteoreem: $\sin B=\dfrac{60\sin110^\circ}{119{,}64}\approx0{,}4713$, $B\approx28{,}12^\circ$ (terav, sest nurk $A$ on nürinurk).`, 3],
          ['Leia krundi pindala.', 2, '2396,22|2396,2', r`$S=\dfrac12\cdot85\cdot60\cdot\sin110^\circ\approx2396{,}22$ m².`, 2],
          ['Leia lühim kaugus tipust A teeni.', 2, '40,06|40,1', r`Lühim kaugus on kõrgus: $h=\dfrac{2S}{BC}=\dfrac{2\cdot2396{,}22}{119{,}64}\approx40{,}06$ m.`, 2],
          ['Mitu sekundit kulub tipust A teeni lühimat teed mööda kiirusega 1,2 m/s?', 1, '33,38|33,4', r`$t=\dfrac{40{,}06}{1{,}2}\approx33{,}38$ s.`, 1],
        ] },
    ],
    part2: [
      { topic: 'Trigonomeetria: liitmisvalemid ja võrrand radiaanides', context: r`Antud on avaldis $A(x)=\sin\left(x+\dfrac\pi6\right)+\sin\left(x-\dfrac\pi6\right)$.`, parts: [
        [r`Näita liitmisvalemitega, et $A(x)=\sqrt3\sin x$.`, 3, '', r`$\sin\left(x\pm\frac\pi6\right)=\sin x\cos\frac\pi6\pm\cos x\sin\frac\pi6$. Summas koonduvad koosinusega liikmed: $A(x)=2\sin x\cos\dfrac\pi6=2\cdot\dfrac{\sqrt3}{2}\sin x=\sqrt3\sin x$.`, 4],
        [r`Lahenda võrrand $A(x)=\dfrac32$ lõigul $[0;2\pi]$.`, 3, 'π/3; 2π/3|1,05; 2,09', r`$\sqrt3\sin x=\dfrac32$, $\sin x=\dfrac{3}{2\sqrt3}=\dfrac{\sqrt3}{2}$: $x=\dfrac\pi3$ või $x=\pi-\dfrac\pi3=\dfrac{2\pi}3$.`, 4],
        [r`Lahenda võrratus $A(x)>\dfrac32$ lõigul $[0;2\pi]$.`, 2, 'π/3<x<2π/3|(π/3;2π/3)', r`$\sin x>\dfrac{\sqrt3}2$: siinusoid on sirgest $y=\frac{\sqrt3}2$ kõrgemal lahendite vahel: $\dfrac\pi3<x<\dfrac{2\pi}3$.`, 3],
        [r`Leia funktsiooni $y=A(x)$ graafiku puutuja tõus kohal $x=\dfrac\pi3$.`, 2, '0,87|√3/2', r`$A'(x)=\sqrt3\cos x$, $A'\left(\dfrac\pi3\right)=\sqrt3\cdot\dfrac12=\dfrac{\sqrt3}2\approx0{,}87$.`, 2],
      ] },
      { topic: 'Puutuja, pindala ja pöördkeha', context: r`Antud on parabool $y=4-x^2$.`, grid: { xmin: -3, xmax: 3, ymin: -1, ymax: 6, step: 1, blank: true }, parts: [
        ['Koosta parabooli puutuja võrrand punktis, mille abstsiss on 1.', 2, 'y=-2x+5|y=5-2x', r`$y(1)=3$, $y'=-2x$, $y'(1)=-2$: $y-3=-2(x-1)$, $y=-2x+5$.`, 3],
        [r`Joonesta parabool ja puutuja ning viiruta kujund, mida piiravad parabool, puutuja ja $y$-telg.`, 2, '', r`Parabool: haripunkt $(0;4)$, nullkohad $\pm2$, harud all; puutuja läbib punkte $(0;5)$ ja $(1;3)$. Kujund on lõigul $0\le x\le1$ parabooli ja puutuja vahel.`, 0],
        ['Arvuta selle kujundi pindala.', 3, '1/3|0,33', r`Puutuja on parabooli kohal: $S=\displaystyle\int_0^1\big((-2x+5)-(4-x^2)\big)dx=\int_0^1(x^2-2x+1)\,dx=\left[\dfrac{x^3}3-x^2+x\right]_0^1=\dfrac13$.`, 4],
        [r`Parabooli ja $x$-teljega piiratud kujund pöörleb ümber $x$-telje. Leia tekkiva pöördkeha ruumala.`, 3, '107,23|512π/15', r`$V=\pi\displaystyle\int_{-2}^{2}(4-x^2)^2dx=2\pi\int_0^2(16-8x^2+x^4)\,dx=2\pi\left[16x-\dfrac{8x^3}3+\dfrac{x^5}5\right]_0^2=2\pi\left(32-\dfrac{64}3+\dfrac{32}5\right)=\dfrac{512\pi}{15}\approx107{,}23$.`, 4],
      ] },
      { topic: 'Rööpkülik koordinaatides (vektorid)', context: r`Rööpküliku $ABCD$ kolm tippu on $A(-3;-1)$, $B(3;1)$ ja $C(5;5)$.`, parts: [
        [r`Leia tipu $D$ koordinaadid.`, 2, '(-1; 3)', r`$\overrightarrow{AD}=\overrightarrow{BC}=(2;4)$, seega $D=(-3+2;-1+4)=(-1;3)$.`, 2],
        ['Leia diagonaalide lõikepunkt.', 1, '(1; 2)', r`Diagonaalid poolitavad teineteist: $AC$ keskpunkt $\left(\dfrac{-3+5}2;\dfrac{-1+5}2\right)=(1;2)$.`, 1],
        [r`Leia rööpküliku nurk $A$.`, 3, '45', r`$\overrightarrow{AB}=(6;2)$, $\overrightarrow{AD}=(2;4)$. $\cos A=\dfrac{12+8}{\sqrt{40}\cdot\sqrt{20}}=\dfrac{20}{\sqrt{800}}=\dfrac{\sqrt2}2$, $A=45^\circ$.`, 4],
        ['Leia rööpküliku pindala.', 2, '20', r`$S=|AB|\cdot|AD|\sin A=\sqrt{40}\cdot\sqrt{20}\cdot\dfrac{\sqrt2}2=\sqrt{800}\cdot\dfrac{\sqrt2}2=20$.`, 2],
        [r`Koosta diagonaali $BD$ sirge võrrand.`, 2, 'y=-x/2+5/2|y=-0,5x+2,5|x+2y-5=0', r`$\overrightarrow{BD}=(-4;2)$, tõus $-\dfrac12$: $y-1=-\dfrac12(x-3)$, $y=-\dfrac12x+\dfrac52$ (kontroll: läbib punkti $(1;2)$).`, 3],
      ] },
      { topic: 'Logaritmfunktsioonid ja logaritmvõrrand', context: r`Antud on funktsioonid $f(x)=\log_2(x+2)$ ja $g(x)=\log_2(4-x)$.`, parts: [
        [r`Leia funktsiooni $f$ nullkoht ja näita, et punkt $P(6;3)$ asub funktsiooni $f$ graafikul.`, 2, '-1', r`$\log_2(x+2)=0\Rightarrow x+2=1$, $x=-1$. $f(6)=\log_2 8=3$, seega $P$ on graafikul.`, 2],
        [r`Leia funktsiooni $h(x)=f(x)+g(x)$ määramispiirkond.`, 2, '-2<x<4|(-2;4)', r`$x+2>0$ ja $4-x>0$: $-2<x<4$.`, 2],
        [r`Lahenda võrrand $f(x)+g(x)=3$.`, 3, '0; 2', r`$\log_2\big((x+2)(4-x)\big)=3$, $(x+2)(4-x)=8$, $-x^2+2x+8=8$, $x(2-x)=0$: $x=0$ või $x=2$; mõlemad on määramispiirkonnas.`, 4],
        ['Leia graafikute lõikepunkt.', 2, '(1; 1,58)|(1; log₂3)', r`$\log_2(x+2)=\log_2(4-x)\Rightarrow x+2=4-x$, $x=1$; $y=\log_2 3\approx1{,}58$.`, 3],
        [r`Lahenda võrratus $f(x)>g(x)$.`, 1, '1<x<4|(1;4)', r`Alus $2>1$: $x+2>4-x$, $x>1$; koos määramispiirkonnaga $1<x<4$.`, 2],
      ] },
      { topic: 'Stereomeetria (prisma ja lõige)', context: 'Korrapärase kolmnurkse prisma ABCA₁B₁C₁ põhiserv on 6 cm ja külgserv 8 cm. Läbi põhiserva AB ja tipu C₁ on tehtud lõige.',
        figure: { kind: 'solid', solid: 'prism', base: 3, caption: 'Korrapärane kolmnurkne prisma.', names: 'A B C A₁ B₁ C₁', a: 'a = 6', H: 'H = 8' }, parts: [
          ['Leia prisma ruumala.', 2, '124,71|72√3', r`$S_p=\dfrac{\sqrt3}4\cdot6^2=9\sqrt3$, $V=9\sqrt3\cdot8=72\sqrt3\approx124{,}71$ cm³.`, 2],
          [r`Lõige on kolmnurk $ABC_1$. Leia selle kõrgus $C_1M$, kus $M$ on serva $AB$ keskpunkt.`, 2, '9,54|√91', r`$CM$ on põhja kõrgus: $CM=\dfrac{\sqrt3}2\cdot6=3\sqrt3$. Täisnurksest kolmnurgast $MCC_1$: $C_1M=\sqrt{27+64}=\sqrt{91}\approx9{,}54$ cm.`, 3],
          ['Leia lõike pindala.', 2, '28,62|3√91', r`$S=\dfrac12\cdot6\cdot\sqrt{91}=3\sqrt{91}\approx28{,}62$ cm².`, 2],
          ['Leia lõike ja prisma põhja vaheline nurk.', 2, '57|57,0', r`Nurk on $\angle C_1MC$, sest $C_1M\perp AB$ ja $CM\perp AB$: $\tan\varphi=\dfrac{8}{3\sqrt3}\approx1{,}540$, $\varphi\approx57{,}0^\circ$.`, 3],
          [r`Lõige jaotab prisma kaheks osaks. Leia väiksema osa (püramiidi $C_1ABC$) ruumala.`, 2, '41,57|24√3', r`Püramiidi põhi on prisma põhi ja kõrgus on külgserv: $V=\dfrac13\cdot9\sqrt3\cdot8=24\sqrt3\approx41{,}57$ cm³ (kolmandik prismast).`, 2],
        ] },
    ],
    self: ['Lõpetasin I osa 120 minutiga.', 'Lõpetasin II osa 150 minutiga.', 'Kirjutasin igas ülesandes lahenduskäigu.', 'Kontrollisin logaritmvõrrandi lahendeid määramispiirkonnaga.', 'Tean, milliseid teemasid pean kordama.'],
  },
  {
    title: 'Proovieksam 3',
    ru: 'Пробный экзамен 3',
    can: CAN,
    part1: [
      { topic: 'Juhuslik suurus ja keskväärtus', context: r`Täringut visatakse kaks korda. Juhuslik suurus $X$ on kahest tulemusest suurem (kui tulemused on võrdsed, siis see arv).`, parts: [
        [r`Leia $P(X=6)$.`, 1, '11/36|0,306|0,31', r`Kõiki tulemusi on $36$. $X=6$, kui vähemalt üks vise on $6$: $36-25=11$ tulemust; $P=\dfrac{11}{36}\approx0{,}306$.`, 2],
        [r`Leia $P(X\le3)$.`, 1, '1/4|0,25', r`Mõlemad visked on $\le3$: $3\cdot3=9$ tulemust; $P=\dfrac{9}{36}=\dfrac14$.`, 2],
        [r`Koosta $X$ jaotustabel ja leia keskväärtus $E(X)$.`, 3, '4,47|161/36', r`$P(X\le k)=\dfrac{k^2}{36}$, seega $P(X=k)=\dfrac{k^2-(k-1)^2}{36}=\dfrac{2k-1}{36}$: $\dfrac1{36},\dfrac3{36},\dfrac5{36},\dfrac7{36},\dfrac9{36},\dfrac{11}{36}$. $E(X)=\dfrac{1\cdot1+2\cdot3+3\cdot5+4\cdot7+5\cdot9+6\cdot11}{36}=\dfrac{161}{36}\approx4{,}47$.`, 4],
      ] },
      { topic: 'Tekstülesanne kolme tundmatuga', context: 'Kohvikus maksti kolme tellimuse eest: kohv, tee ja saiake — 5,90 €; kaks kohvi ja kolm saiakest — 9,80 €; tee ja kaks saiakest — 5,00 €.', parts: [
        ['Tähista hinnad ja koosta võrrandisüsteem.', 2, '', r`$k$ — kohv, $t$ — tee, $s$ — saiake (€): $\begin{cases}k+t+s=5{,}9\\2k+3s=9{,}8\\t+2s=5\end{cases}$`, 3],
        ['Leia kohvi, tee ja saiakese hind.', 3, '2,5; 1,8; 1,6', r`Kolmandast võrrandist $t=5-2s$; esimesest $k=5{,}9-t-s=0{,}9+s$. Teise: $2(0{,}9+s)+3s=9{,}8$, $5s=8$, $s=1{,}6$; $k=2{,}5$, $t=1{,}8$. Kohv maksab $2{,}50$ €, tee $1{,}80$ €, saiake $1{,}60$ €.`, 5],
      ] },
      { topic: 'Avaldise lihtsustamine', parts: [
        [r`Lihtsusta avaldis $\dfrac{a^3-8}{a^2-4}:\dfrac{a^2+2a+4}{a^2+2a}$.`, 3, 'a', r`$a^3-8=(a-2)(a^2+2a+4)$, $a^2-4=(a-2)(a+2)$, $a^2+2a=a(a+2)$. $\dfrac{(a-2)(a^2+2a+4)}{(a-2)(a+2)}\cdot\dfrac{a(a+2)}{a^2+2a+4}=a$.`, 5],
        [r`Lihtsusta avaldis $\dfrac{2^{n+2}-2^n}{3\cdot2^{n-1}}$.`, 2, '2', r`$2^{n+2}-2^n=2^n(4-1)=3\cdot2^n$; $\dfrac{3\cdot2^n}{3\cdot2^{n-1}}=2^{n-(n-1)}=2$.`, 3],
      ] },
      { topic: 'Ruutvõrratus (geomeetriline tingimus)', context: r`Ristküliku ümbermõõt on 30 cm; ühe külje pikkus on $x$ cm.`, parts: [
        [r`Milliste $x$ väärtuste korral on ristküliku pindala vähemalt 50 cm²?`, 3, '5<=x<=10|5≤x≤10|[5;10]', r`Teine külg on $15-x$, $0<x<15$. $x(15-x)\ge50$, $x^2-15x+50\le0$, nullkohad $5$ ja $10$, harud üleval: $5\le x\le10$.`, 4],
        [r`Millise $x$ korral on ristküliku diagonaal kõige lühem? Leia selle pikkus.`, 2, '7,5; 10,61|7,5; 7,5√2', r`$d^2=x^2+(15-x)^2=2x^2-30x+225$ on vähim haripunktis $x=\dfrac{30}{4}=7{,}5$ (ruut): $d=\sqrt{112{,}5}=7{,}5\sqrt2\approx10{,}61$ cm.`, 3],
      ] },
      { topic: 'Funktsiooni uurimine (ratsionaalfunktsioon)', context: r`Antud on funktsioon $f(x)=\dfrac{x^2+3}{x-1}$.`, parts: [
        [r`Leia funktsiooni määramispiirkond ja graafiku lõikepunkt $y$-teljega.`, 1, '(0; -3)', r`$x\ne1$. $f(0)=\dfrac{3}{-1}=-3$: punkt $(0;-3)$.`, 2],
        [r`Leia $f'(x)$.`, 2, '(x^2-2x-3)/(x-1)^2|(x²-2x-3)/(x-1)²', r`Jagatise tuletis: $f'(x)=\dfrac{2x(x-1)-(x^2+3)}{(x-1)^2}=\dfrac{x^2-2x-3}{(x-1)^2}$.`, 3],
        ['Leia ekstreemumpunktid ja nende liik.', 3, '(-1; -2); (3; 6)', r`$x^2-2x-3=0$: $x=-1$, $x=3$. Märk: $x<-1$: $+$; $-1<x<1$: $-$; $1<x<3$: $-$; $x>3$: $+$. Maksimumpunkt $(-1;-2)$, miinimumpunkt $(3;6)$ (maksimum on väiksem kui miinimum, sest vahel on katkevuskoht $x=1$).`, 4],
        ['Kirjuta kasvamis- ja kahanemisvahemikud.', 2, '', r`Kasvab: $x<-1$ ja $x>3$; kahaneb: $-1<x<1$ ja $1<x<3$.`, 2],
        [r`Leia funktsiooni suurim ja vähim väärtus lõigul $[2;5]$.`, 2, '7; 6', r`$f(2)=\dfrac{7}{1}=7$, $f(3)=6$, $f(5)=\dfrac{28}{4}=7$. Suurim väärtus $7$, vähim $6$.`, 3],
      ] },
      { topic: 'Hääbuv geomeetriline jada', context: 'Ruudu külg on 8 cm. Ruudu külgede keskpunktid ühendatakse ja saadakse uus ruut; selle külgede keskpunktide ühendamisel saadakse järgmine ruut jne (lõputult).', parts: [
        ['Leia viienda ruudu külje pikkus.', 2, '2', r`Järgmise ruudu külg on pool eelmise diagonaalist: $a_{n+1}=\dfrac{a_n\sqrt2}{2}=\dfrac{a_n}{\sqrt2}$. $a_5=8\cdot\left(\dfrac1{\sqrt2}\right)^4=\dfrac84=2$ cm.`, 3],
        ['Leia kõigi ruutude pindalade summa.', 2, '128', r`Pindalad $64, 32, 16,\dots$, $q=\dfrac12$: $S=\dfrac{64}{1-\frac12}=128$ cm².`, 2],
        ['Leia kõigi ruutude ümbermõõtude summa.', 3, '109,25|64+32√2', r`Ümbermõõdud $32, 16\sqrt2, 16,\dots$, $q=\dfrac1{\sqrt2}$: $S=\dfrac{32}{1-\frac1{\sqrt2}}=\dfrac{32\sqrt2}{\sqrt2-1}=32\sqrt2(\sqrt2+1)=64+32\sqrt2\approx109{,}25$ cm.`, 4],
        ['Mitmenda ruudu pindala on esimest korda väiksem kui 0,1 cm²?', 3, '11', r`$64\cdot\left(\dfrac12\right)^{n-1}<0{,}1$, $2^{n-1}>640$. $2^9=512$, $2^{10}=1024$, seega $n-1=10$, $n=11$.`, 4],
      ] },
      { topic: 'Kolmnurk (kolm külge, ümber- ja siseringjoon)', context: 'Kolmnurkse lillepeenra küljed on BC = 7 m, AC = 8 m ja AB = 9 m.',
        figure: { kind: 'triangle', caption: 'Lillepeenar ABC.', names: 'A B C', a: '7', b: '8', c: '9', sideA: '7 m', sideB: '8 m', sideC: '9 m', angleC: 'γ = ?' }, parts: [
          ['Leia peenra suurim nurk.', 3, '73,4|73,40', r`Suurim nurk on suurima külje vastas (nurk $C$): $\cos C=\dfrac{7^2+8^2-9^2}{2\cdot7\cdot8}=\dfrac{32}{112}=\dfrac27$, $C\approx73{,}40^\circ$.`, 4],
          ['Leia peenra pindala.', 2, '26,83|12√5', r`$\sin C=\sqrt{1-\dfrac4{49}}=\dfrac{\sqrt{45}}7=\dfrac{3\sqrt5}{7}$; $S=\dfrac12\cdot7\cdot8\cdot\dfrac{3\sqrt5}7=12\sqrt5\approx26{,}83$ m².`, 3],
          ['Leia peenra ümberringjoone raadius.', 2, '4,7|4,70', r`Siinusteoreem: $2R=\dfrac{c}{\sin C}$, $R=\dfrac{9}{2\cdot\frac{3\sqrt5}{7}}=\dfrac{21}{2\sqrt5}\approx4{,}70$ m.`, 2],
          ['Leia peenra siseringjoone raadius.', 1, '2,24|√5', r`Poolümbermõõt $p=\dfrac{7+8+9}2=12$; $r=\dfrac{S}{p}=\dfrac{12\sqrt5}{12}=\sqrt5\approx2{,}24$ m.`, 2],
          [r`Vihmuti on siseringjoone keskpunktis ja kastab ringi raadiusega $r$. Mitu protsenti peenrast jääb kastmata?`, 2, '41,46|41,5', r`Kastetud ala $\pi r^2=5\pi\approx15{,}71$ m². Kastmata $\dfrac{12\sqrt5-5\pi}{12\sqrt5}\cdot100\%\approx41{,}46\%$.`, 3],
        ] },
    ],
    part2: [
      { topic: 'Trigonomeetriline võrrand ja võrratus radiaanides', context: r`Antud on funktsioonid $f(x)=\cos2x$ ja $g(x)=\cos x$ lõigul $[0;2\pi]$.`, grid: { angle: 'rad', xmin: 0, xmax: 6.5, ymin: -1.5, ymax: 1.5, step: 0.5, stepY: 0.5, labelEvery: 2, blank: true }, parts: [
        [r`Lahenda võrrand $\cos2x=\cos x$ lõigul $[0;2\pi]$.`, 4, '0; 2π/3; 4π/3; 2π|0; 2,09; 4,19; 6,28', r`$\cos2x=2\cos^2x-1$: $2\cos^2x-\cos x-1=0$, $(\cos x-1)(2\cos x+1)=0$. $\cos x=1$: $x=0$, $x=2\pi$; $\cos x=-\dfrac12$: $x=\dfrac{2\pi}3$, $x=\dfrac{4\pi}3$.`, 5],
        ['Joonesta mõlema funktsiooni graafik ühes teljestikus ja märgi lõikepunktid.', 3, '', r`$y=\cos x$: $(0;1)$, $(\pi;-1)$, $(2\pi;1)$; $y=\cos2x$ (periood $\pi$): $(0;1)$, $\left(\frac\pi2;-1\right)$, $(\pi;1)$, $\left(\frac{3\pi}2;-1\right)$, $(2\pi;1)$. Lõikepunktid: $(0;1)$, $\left(\frac{2\pi}3;-\frac12\right)$, $\left(\frac{4\pi}3;-\frac12\right)$, $(2\pi;1)$.`, 0],
        [r`Lahenda võrratus $\cos2x>\cos x$ lõigul $[0;2\pi]$.`, 3, '2π/3<x<4π/3|(2π/3;4π/3)', r`$(\cos x-1)(2\cos x+1)>0$. Et $\cos x-1\le0$, peab olema $\cos x-1<0$ ja $2\cos x+1<0$: $\cos x<-\dfrac12$, seega $\dfrac{2\pi}3<x<\dfrac{4\pi}3$ (joonisel on $y=\cos2x$ seal kõrgemal).`, 4],
      ] },
      { topic: 'Puutuja, pindala ja pöördkeha (ruutjuur)', context: r`Antud on funktsioon $f(x)=\sqrt x$.`, grid: { xmin: -5, xmax: 5, ymin: -1, ymax: 4, step: 1, blank: true }, parts: [
        [r`Koosta graafiku puutuja võrrand kohal $x=4$.`, 3, 'y=x/4+1|y=0,25x+1', r`$f(4)=2$, $f'(x)=\dfrac1{2\sqrt x}$, $f'(4)=\dfrac14$: $y-2=\dfrac14(x-4)$, $y=\dfrac x4+1$.`, 3],
        [r`Joonesta graafik ja puutuja ning viiruta kujund, mida piiravad graafik, puutuja ja $y$-telg.`, 2, '', r`Graafik: $(0;0)$, $(1;1)$, $(4;2)$; puutuja: $(-4;0)$, $(0;1)$, $(4;2)$. Kujund on lõigul $0\le x\le4$ puutuja ja graafiku vahel.`, 0],
        ['Arvuta selle kujundi pindala.', 3, '2/3|0,67', r`$S=\displaystyle\int_0^4\left(\dfrac x4+1-\sqrt x\right)dx=\left[\dfrac{x^2}8+x-\dfrac23x^{\frac32}\right]_0^4=2+4-\dfrac{16}3=\dfrac23$.`, 4],
        [r`Graafiku, $x$-telje ja sirgega $x=4$ piiratud kujund pöörleb ümber $x$-telje. Leia pöördkeha ruumala.`, 2, '25,13|8π', r`$V=\pi\displaystyle\int_0^4(\sqrt x)^2dx=\pi\left[\dfrac{x^2}2\right]_0^4=8\pi\approx25{,}13$.`, 3],
      ] },
      { topic: 'Kolmnurk koordinaatides (sirged ja kõrgus)', context: r`Kolmnurga tipud on $A(-2;-1)$, $B(6;3)$ ja $C(-1;7)$.`, parts: [
        [r`Koosta sirge $AB$ võrrand.`, 2, 'y=x/2|y=0,5x|x-2y=0', r`Tõus $k=\dfrac{3-(-1)}{6-(-2)}=\dfrac12$; $y+1=\dfrac12(x+2)$, $y=\dfrac x2$.`, 2],
        [r`Koosta tipust $C$ tõmmatud kõrguse sirge võrrand.`, 2, 'y=-2x+5|y=5-2x|2x+y-5=0', r`Kõrgus on sirgega $AB$ risti: tõus $-2$; $y-7=-2(x+1)$, $y=-2x+5$.`, 2],
        [r`Leia kõrguse aluspunkt $H$.`, 2, '(2; 1)', r`$\dfrac x2=-2x+5$, $x=2$, $y=1$: $H(2;1)$.`, 2],
        ['Leia kolmnurga pindala.', 2, '30', r`$|AB|=\sqrt{8^2+4^2}=4\sqrt5$, $|CH|=\sqrt{3^2+6^2}=3\sqrt5$. $S=\dfrac12\cdot4\sqrt5\cdot3\sqrt5=30$.`, 3],
        [r`Leia kolmnurga nurk $A$.`, 2, '56,31|56,3', r`$\overrightarrow{AB}=(8;4)$, $\overrightarrow{AC}=(1;8)$: $\cos A=\dfrac{8+32}{\sqrt{80}\cdot\sqrt{65}}=\dfrac{40}{\sqrt{5200}}\approx0{,}5547$, $A\approx56{,}31^\circ$.`, 3],
      ] },
      { topic: 'Eksponentmudel ja logaritmid', context: r`Bakterite arv kasvab seaduse $N(t)=N_0e^{kt}$ järgi ($t$ tundides). Alguses oli baktereid 500, 3 tunni pärast 2000.`, parts: [
        [r`Leia $N_0$ ja $k$.`, 3, '500; 0,46|500; ln4/3', r`$N_0=N(0)=500$. $500e^{3k}=2000$, $e^{3k}=4$, $k=\dfrac{\ln4}3\approx0{,}462$.`, 4],
        ['Mitu bakterit on 5 tunni pärast?', 2, '5039,68|5040', r`$N(5)=500e^{5k}=500\cdot4^{\frac53}\approx5040$.`, 2],
        ['Mitme tunni pärast ületab bakterite arv 100 000?', 3, '11,47|11,5', r`$500\cdot4^{\frac t3}=100\,000$, $4^{\frac t3}=200$, $t=\dfrac{3\ln200}{\ln4}\approx11{,}47$ h.`, 4],
        [r`Leia kasvukiirus $N'(3)$.`, 2, '924,2|924', r`$N'(t)=kN_0e^{kt}=kN(t)$, $N'(3)=\dfrac{\ln4}3\cdot2000\approx924$ bakterit tunnis.`, 3],
      ] },
      { topic: 'Stereomeetria (korrapärane püramiid)', context: 'Korrapärase nelinurkse püramiidi SABCD põhiserv on 10 cm ja külgserva ning põhja vaheline nurk on 60°.',
        figure: { kind: 'solid', solid: 'pyramid', caption: 'Püramiid SABCD.', names: 'A B C D S O', a: 'a = 10', s: 's = ?', H: 'H = ?', triangle: 's' }, parts: [
          ['Leia püramiidi kõrgus.', 2, '12,25|5√6', r`Pool põhja diagonaali $OB=5\sqrt2$. Täisnurksest kolmnurgast $SOB$: $H=5\sqrt2\tan60^\circ=5\sqrt6\approx12{,}25$ cm.`, 3],
          ['Leia külgserva pikkus.', 2, '14,14|10√2', r`$s=\dfrac{5\sqrt2}{\cos60^\circ}=10\sqrt2\approx14{,}14$ cm.`, 2],
          ['Leia külgtahu ja põhja vaheline nurk.', 2, '67,79|67,8', r`Apoteemi projektsioon on pool põhiservast, $5$ cm: $\tan\varphi=\dfrac{5\sqrt6}5=\sqrt6$, $\varphi\approx67{,}79^\circ$.`, 3],
          ['Leia püramiidi täispindala.', 2, '364,58|100+100√7', r`Apoteem $k=\sqrt{H^2+5^2}=\sqrt{150+25}=5\sqrt7$; $S_k=4\cdot\dfrac12\cdot10\cdot5\sqrt7=100\sqrt7$; $S_t=100+100\sqrt7\approx364{,}58$ cm².`, 3],
          ['Leia püramiidi ruumala.', 2, '408,25|500√6/3', r`$V=\dfrac13\cdot100\cdot5\sqrt6=\dfrac{500\sqrt6}3\approx408{,}25$ cm³.`, 2],
        ] },
    ],
    self: ['Lõpetasin I osa 120 minutiga.', 'Lõpetasin II osa 150 minutiga.', 'Kirjutasin igas ülesandes lahenduskäigu.', 'Ümardasin alles lõpus ja kirjutasin ühikud.', 'Tean, milliseid teemasid pean kordama.'],
  },
];
