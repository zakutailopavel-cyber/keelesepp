// Matemaatika kitsas riigieksam: three full mock exams (mk12-015…017) in the 2027 format (docs/MATH_RIIGIEKSAM_KITSAS.md):
//   I osa 120 min — tasks 1–4 of 5 p and tasks 5–7 of 10 p; II osa 150 min — tasks 8–12 of 10 p; total 100 p.
// Every task is our own (Harno past papers are a format reference only); realistic contexts. Same part format as
// kitsas12.js: [text, points, answer, solution, rows?] — answer '' = the teacher judges it; several right forms are
// separated by |, several answers by ; (engine/mathExpr.js sameMathAnswer). `topic` names the recurring task type: it is
// shown only on the self-analysis sheet, not on the exam sheets (the real paper does not name the topic either).
const r = String.raw;

const DEG_GRID = { angle: 'deg', xmin: 0, xmax: 360, step: 30, labelEvery: 3, blank: true };

export const KITSAS_12_MOCKS = [
  {
    title: 'Proovieksam 1',
    ru: 'Пробный экзамен 1',
    can: 'Õpilane lahendab kitsa matemaatika riigieksami täisvariandi ettenähtud ajaga ja kirjutab lahenduskäigu samm-sammult.',
    part1: [
      { topic: 'Avaldise lihtsustamine', context: r`Antud on avaldis $\left(\dfrac{a}{a-2}-\dfrac{4}{a^2-2a}\right):\dfrac{a+2}{a^2}$.`, parts: [
        ['Lihtsusta avaldis.', 3, 'a', r`$\dfrac{a}{a-2}-\dfrac{4}{a(a-2)}=\dfrac{a^2-4}{a(a-2)}=\dfrac{(a-2)(a+2)}{a(a-2)}=\dfrac{a+2}{a}$. Jagamine = korrutamine pöördarvuga: $\dfrac{a+2}{a}\cdot\dfrac{a^2}{a+2}=a$.`, 6],
        [r`Millise $a$ väärtuse korral ei ole avaldis määratud?`, 2, '0; 2; -2', r`Nimetajad $a-2$, $a^2-2a=a(a-2)$ ja $a^2$ ei tohi olla $0$: $a\ne0$, $a\ne2$; jagaja $\dfrac{a+2}{a^2}\ne0$: $a\ne-2$.`, 3],
      ] },
      { topic: 'Protsendid', context: 'Elektri hind oli jaanuaris 0,16 €/kWh. Veebruaris tõusis hind 25%, märtsis langes veebruari hinnast 20%.', parts: [
        ['Mis oli elektri hind märtsis?', 2, '0,16', r`$0{,}16\cdot1{,}25\cdot0{,}8=0{,}16$ €/kWh — sama mis jaanuaris, sest $1{,}25\cdot0{,}8=1$.`, 3],
        ['Pere kasutas jaanuaris 450 kWh ja veebruaris 380 kWh elektrit. Mitu protsenti muutus veebruari arve jaanuari arvega võrreldes?', 3, '5,56|5,6', r`Jaanuar: $450\cdot0{,}16=72$ €. Veebruari hind $0{,}16\cdot1{,}25=0{,}20$ €/kWh, arve $380\cdot0{,}20=76$ €. Muutus $\dfrac{76-72}{72}\cdot100\%\approx5{,}56\%$ (tõus).`, 4],
      ] },
      { topic: 'Eksponent- ja logaritmvõrrand', parts: [
        [r`Lahenda võrrand $2^{x+3}-2^x=56$.`, 2, '3', r`$2^x(2^3-1)=56$, $7\cdot2^x=56$, $2^x=8=2^3$, $x=3$.`, 3],
        [r`Lahenda võrrand $\log_3(x+5)+\log_3(x-1)=3$.`, 3, '4', r`Peab olema $x>1$. $\log_3\big((x+5)(x-1)\big)=3$, $(x+5)(x-1)=27$, $x^2+4x-32=0$, $x=4$ või $x=-8$. $x=-8$ ei sobi ($x>1$). Vastus $x=4$.`, 5],
      ] },
      { topic: 'Tõenäosus', context: 'Klassis on 12 tüdrukut ja 8 poissi. Klassi esindajateks valitakse loosiga kaks õpilast.', parts: [
        ['Leia tõenäosus, et mõlemad valitud on tüdrukud.', 2, '33/95|0,347|0,35', r`$P=\dfrac{12}{20}\cdot\dfrac{11}{19}=\dfrac{132}{380}=\dfrac{33}{95}\approx0{,}347$`, 3],
        ['Leia tõenäosus, et valitakse üks tüdruk ja üks poiss.', 3, '48/95|0,505|0,51', r`Tüdruk, siis poiss või poiss, siis tüdruk: $P=\dfrac{12}{20}\cdot\dfrac{8}{19}+\dfrac{8}{20}\cdot\dfrac{12}{19}=\dfrac{192}{380}=\dfrac{48}{95}\approx0{,}505$`, 4],
      ] },
      { topic: 'Võrratus ja juurvõrrand', context: r`Antud on funktsioonid $f(x)=x^2-3x$ ja $g(x)=x+5$.`, parts: [
        [r`Lahenda võrratus $f(x)\le g(x)$.`, 4, '-1<=x<=5|-1≤x≤5|[-1;5]', r`$x^2-3x\le x+5$, $x^2-4x-5\le0$. Nullkohad: $x=-1$ ja $x=5$. Parabooli harud on üleval, seega $-1\le x\le5$.`, 6],
        ['Mitu täisarvu rahuldab seda võrratust?', 2, '7', r`$-1,0,1,2,3,4,5$ — kokku $7$.`, 2],
        [r`Lahenda võrrand $\sqrt{g(x)}=x-1$ ja tee kontroll.`, 4, '4', r`$\sqrt{x+5}=x-1$; ruutu: $x+5=x^2-2x+1$, $x^2-3x-4=0$, $x=4$ või $x=-1$. Kontroll: $x=4$: $\sqrt9=3=3$ ✓; $x=-1$: $\sqrt4=2\ne-2$ — võõrlahend. Vastus $x=4$.`, 6],
      ] },
      { topic: 'Vektorid ja sirge', context: r`Antud on punktid $A(-2;1)$, $B(4;3)$ ja $C(2;9)$.`, parts: [
        [r`Leia vektori $\overrightarrow{AB}$ koordinaadid.`, 1, '(6; 2)', r`$\overrightarrow{AB}=(4-(-2);\,3-1)=(6;2)$`, 2],
        [r`Leia vektori $\overrightarrow{AB}$ pikkus.`, 1, '6,32|√40|2√10', r`$|\overrightarrow{AB}|=\sqrt{6^2+2^2}=\sqrt{40}=2\sqrt{10}\approx6{,}32$`, 2],
        [r`Koosta sirge $AB$ võrrand.`, 3, 'y=x/3+5/3|y=(1/3)x+5/3|x-3y+5=0', r`Tõus $k=\dfrac{2}{6}=\dfrac13$. $y-1=\dfrac13(x+2)$, seega $y=\dfrac13x+\dfrac53$.`, 4],
        ['Näita skalaarkorrutisega, et kolmnurk ABC on täisnurkne. Millise tipu juures on täisnurk?', 3, 'B', r`$\overrightarrow{BA}=(-6;-2)$, $\overrightarrow{BC}=(-2;6)$, $\overrightarrow{BA}\cdot\overrightarrow{BC}=12-12=0$, seega $\angle B=90^\circ$.`, 4],
        ['Leia kolmnurga ABC pindala.', 2, '20', r`Kaatetid $|BA|=\sqrt{40}$ ja $|BC|=\sqrt{4+36}=\sqrt{40}$: $S=\dfrac12\cdot\sqrt{40}\cdot\sqrt{40}=20$.`, 3],
      ] },
      { topic: 'Aritmeetiline jada (tekstülesanne)', context: 'Vabaõhulava esimeses reas on 18 kohta ja iga järgmine rida on eelmisest 3 koha võrra pikem. Ridu on 20.', parts: [
        ['Mitu kohta on viimases reas?', 2, '75', r`Aritmeetiline jada $a_1=18$, $d=3$: $a_{20}=18+19\cdot3=75$.`, 3],
        ['Mitu kohta on laval kokku?', 3, '930', r`$S_{20}=\dfrac{18+75}{2}\cdot20=930$`, 3],
        ['Mitmendas reas on esimest korda vähemalt 50 kohta?', 2, '12', r`$18+3(n-1)\ge50$, $n-1\ge10{,}67$, $n\ge11{,}67$, seega $n=12$ ($a_{11}=48$, $a_{12}=51$).`, 3],
        ['Publik täidab read eest alates. Mitu esimest rida täituvad, kui tuleb 500 pealtvaatajat (viimane rida võib jääda osaliselt tühjaks)?', 3, '14', r`$S_n=\dfrac{n(36+3(n-1))}{2}\ge500$, $3n^2+33n-1000\ge0$, $n\ge\dfrac{-33+\sqrt{13\,089}}{6}\approx13{,}57$. $S_{13}=468<500$, $S_{14}=525$: vaja on $14$ rida.`, 5],
      ] },
    ],
    part2: [
      { topic: 'Siinus ja koosinus kraadides (graafik)', context: r`Antud on funktsioon $f(x)=2\sin x$ lõigul $[0^\circ;360^\circ]$.`, grid: { ...DEG_GRID, ymin: -2.5, ymax: 2.5, stepY: 0.5 }, parts: [
        ['Joonesta funktsiooni graafik.', 3, '', r`Punktid: $(0^\circ;0)$, $(90^\circ;2)$, $(180^\circ;0)$, $(270^\circ;-2)$, $(360^\circ;0)$, sujuv laine.`, 0],
        ['Leia funktsiooni nullkohad.', 2, '0; 180; 360', r`$2\sin x=0\Rightarrow\sin x=0$: $x=0^\circ$, $180^\circ$, $360^\circ$.`, 2],
        [r`Lahenda võrrand $f(x)=1$ ja kanna sirge $y=1$ joonisele.`, 3, '30; 150', r`$\sin x=0{,}5$: $x_1=30^\circ$, $x_2=180^\circ-30^\circ=150^\circ$.`, 3],
        [r`Leia vahemik, kus $f(x)>1$.`, 2, '30<x<150|(30;150)', r`Graafik on sirgest $y=1$ kõrgemal lõikepunktide vahel: $30^\circ<x<150^\circ$.`, 2],
      ] },
      { topic: 'Kolmnurk (koosinus- ja siinusteoreem)', context: 'Kaks paati väljuvad sadamast S samal ajal. Tunni pärast on paat A sadamast 12 km ja paat B 9 km kaugusel; nende kursside vaheline nurk on 64°.', parts: [
        ['Kui kaugel on paadid tunni pärast teineteisest?', 4, '11,42', r`Koosinusteoreem: $AB^2=12^2+9^2-2\cdot12\cdot9\cos64^\circ=225-216\cos64^\circ\approx130{,}31$, $AB\approx11{,}42$ km.`, 5],
        [r`Leia nurk $SAB$.`, 3, '45,12|45,1', r`Siinusteoreem: $\dfrac{\sin A}{9}=\dfrac{\sin64^\circ}{11{,}42}$, $\sin A\approx0{,}7086$, $A\approx45{,}12^\circ$ (terav, sest külg $9$ ei ole suurim).`, 4],
        [r`Leia kolmnurga $SAB$ pindala.`, 3, '48,53|48,5', r`$S=\dfrac12\cdot12\cdot9\cdot\sin64^\circ\approx48{,}53$ km²`, 3],
      ] },
      { topic: 'Kuupfunktsioon: tuletis, ekstreemumid, puutuja', context: r`Antud on funktsioon $f(x)=x^3-3x^2-9x+5$.`, parts: [
        [r`Leia $f'(x)$.`, 1, '3x^2-6x-9|3x²-6x-9', r`$f'(x)=3x^2-6x-9$`, 2],
        ['Leia funktsiooni ekstreemumkohad.', 2, '-1; 3', r`$3x^2-6x-9=0$, $x^2-2x-3=0$, $x=-1$ või $x=3$.`, 3],
        ['Leia maksimum- ja miinimumpunkt.', 2, '(-1; 10); (3; -22)', r`$f(-1)=-1-3+9+5=10$, $f(3)=27-27-27+5=-22$. $f'$ muutub $-1$ juures $+\to-$: maksimumpunkt $(-1;10)$; $3$ juures $-\to+$: miinimumpunkt $(3;-22)$.`, 3],
        ['Kirjuta kasvamis- ja kahanemisvahemikud.', 2, '', r`Kasvab: $x<-1$ ja $x>3$; kahaneb: $-1<x<3$.`, 2],
        [r`Koosta graafiku puutuja võrrand kohal $x=1$.`, 3, 'y=-12x+6|y=6-12x', r`$f(1)=1-3-9+5=-6$, $f'(1)=3-6-9=-12$. $y=-12(x-1)-6=-12x+6$.`, 4],
      ] },
      { topic: 'Parabool ja pindala integraaliga', context: r`Antud on parabool $y=-x^2+4x$ ja sirge $y=x$.`, grid: { xmin: -1, xmax: 5, ymin: -1, ymax: 5, step: 1, blank: true }, parts: [
        ['Leia parabooli nullkohad.', 1, '0; 4', r`$-x(x-4)=0$: $x=0$ või $x=4$.`, 2],
        ['Leia parabooli haripunkt.', 2, '(2; 4)', r`$x_0=-\dfrac{b}{2a}=-\dfrac{4}{-2}=2$, $y_0=-4+8=4$: haripunkt $(2;4)$.`, 2],
        ['Joonesta parabool ja sirge ühes teljestikus.', 2, '', 'Parabool läbib punkte (0; 0), (2; 4), (4; 0), harud all; sirge läbib (0; 0) ja (3; 3).', 0],
        ['Leia parabooli ja sirge lõikepunktid.', 2, '(0; 0); (3; 3)', r`$-x^2+4x=x$, $x^2-3x=0$, $x=0$ või $x=3$: $(0;0)$ ja $(3;3)$.`, 3],
        ['Arvuta parabooli ja sirgega piiratud kujundi pindala.', 3, '4,5|9/2', r`$S=\displaystyle\int_0^3\big((-x^2+4x)-x\big)dx=\int_0^3(-x^2+3x)\,dx=\left[-\dfrac{x^3}{3}+\dfrac{3x^2}{2}\right]_0^3=-9+13{,}5=4{,}5$`, 4],
      ] },
      { topic: 'Ruumiline keha (silinder)', context: 'Silindrikujulise veepaagi põhja raadius on 1,2 m ja kõrgus 2,5 m.', parts: [
        ['Leia paagi ruumala kuupmeetrites.', 3, '11,31|3,6π', r`$V=\pi r^2h=\pi\cdot1{,}44\cdot2{,}5=3{,}6\pi\approx11{,}31$ m³`, 3],
        ['Mitu liitrit vett on paagis, kui see on 80% ulatuses täis?', 2, '9048|9047,8|9047,79', r`$0{,}8\cdot11{,}31\approx9{,}048$ m³; $1$ m³ $=1000$ l, seega umbes $9048$ l.`, 3],
        ['Paak värvitakse väljast (külg ja mõlemad põhjad). Leia värvitava pinna pindala.', 3, '27,9|27,90|8,88π', r`$S=2\pi r^2+2\pi rh=2\pi r(r+h)=2\pi\cdot1{,}2\cdot3{,}7=8{,}88\pi\approx27{,}90$ m²`, 3],
        ['Üks liiter värvi katab 8 m². Mitu üheliitrist purki tuleb osta?', 2, '4', r`$27{,}9:8\approx3{,}49$ l; purke saab osta ainult tervena, seega $4$ purki.`, 2],
      ] },
    ],
    self: ['Lõpetasin I osa 120 minutiga.', 'Lõpetasin II osa 150 minutiga.', 'Kirjutasin igas ülesandes lahenduskäigu.', 'Kontrollisin juur- ja logaritmvõrrandi lahendeid.', 'Tean, milliseid teemasid pean kordama.'],
  },
  {
    title: 'Proovieksam 2',
    ru: 'Пробный экзамен 2',
    can: 'Õpilane lahendab kitsa matemaatika riigieksami täisvariandi ettenähtud ajaga ja kirjutab lahenduskäigu samm-sammult.',
    part1: [
      { topic: 'Avaldise lihtsustamine', parts: [
        [r`Lihtsusta avaldis $\dfrac{x^2-4x+4}{x^2-4}:\dfrac{3x-6}{x^2+2x}$.`, 3, 'x/3|(1/3)x', r`$x^2-4x+4=(x-2)^2$, $x^2-4=(x-2)(x+2)$, $3x-6=3(x-2)$, $x^2+2x=x(x+2)$. $\dfrac{(x-2)^2}{(x-2)(x+2)}\cdot\dfrac{x(x+2)}{3(x-2)}=\dfrac{x}{3}$.`, 6],
        [r`Arvuta $\left(\dfrac13\right)^{-2}\cdot27^{-\frac23}+\sqrt{0{,}16}$.`, 2, '1,4|7/5', r`$\left(\frac13\right)^{-2}=9$, $27^{-\frac23}=\dfrac{1}{\left(\sqrt[3]{27}\right)^2}=\dfrac19$, $\sqrt{0{,}16}=0{,}4$: $9\cdot\dfrac19+0{,}4=1{,}4$.`, 3],
      ] },
      { topic: 'Võrratused', parts: [
        [r`Lahenda võrratus $\dfrac{x-3}{2}-\dfrac{2x+1}{3}<1$.`, 2, 'x>-17|(-17;∞)', r`Korruta $6$-ga: $3(x-3)-2(2x+1)<6$, $-x-11<6$, $-x<17$, $x>-17$ (märk pöördub).`, 3],
        [r`Lahenda võrratus $x^2\le2x+15$.`, 3, '-3<=x<=5|-3≤x≤5|[-3;5]', r`$x^2-2x-15\le0$; nullkohad $x=-3$ ja $x=5$; harud üleval, seega $-3\le x\le5$.`, 4],
      ] },
      { topic: 'Protsendid ja eksponentvõrrand', context: 'Korteri hind on 120 000 € ja see kasvab igal aastal 6%.', parts: [
        ['Kui palju maksab korter 4 aasta pärast?', 2, '151497,24|151497', r`$120\,000\cdot1{,}06^4\approx151\,497{,}24$ €`, 3],
        ['Mitme aasta pärast ületab korteri hind esimest korda 200 000 €?', 3, '9', r`$120\,000\cdot1{,}06^n>200\,000$, $1{,}06^n>\dfrac53$, $n>\dfrac{\lg\frac53}{\lg1{,}06}\approx8{,}77$. Seega $9$ aasta pärast.`, 4],
      ] },
      { topic: 'Statistika', context: 'Kaheksa õpilase kontrolltöö punktid olid 14, 18, 11, 20, 18, 9, 16 ja 18.', parts: [
        ['Leia aritmeetiline keskmine.', 2, '15,5', r`$\dfrac{14+18+11+20+18+9+16+18}{8}=\dfrac{124}{8}=15{,}5$`, 2],
        ['Leia mediaan.', 2, '17', r`Järjestatult: $9,11,14,16,18,18,18,20$; mediaan $=\dfrac{16+18}{2}=17$.`, 2],
        ['Leia mood.', 1, '18', 'Kõige sagedamini (3 korda) esineb 18.', 0],
      ] },
      { topic: 'Võrrandisüsteem (tekstülesanne)', context: 'Kohvikus maksid 3 kohvi ja 2 saiakest kokku 11,30 €, 2 kohvi ja 5 saiakest kokku 13,40 €.', parts: [
        ['Tähista tundmatud ja koosta võrrandisüsteem.', 3, '', r`$k$ — kohvi hind, $s$ — saiakese hind (eurodes): $\begin{cases}3k+2s=11{,}30\\2k+5s=13{,}40\end{cases}$`, 3],
        ['Leia kohvi ja saiakese hind.', 4, '2,7; 1,6', r`Korruta esimene võrrand $2$-ga ja teine $3$-ga: $6k+4s=22{,}6$, $6k+15s=40{,}2$. Lahuta: $11s=17{,}6$, $s=1{,}6$; $3k=11{,}3-3{,}2=8{,}1$, $k=2{,}7$. Kohv maksab $2{,}70$ €, saiake $1{,}60$ €.`, 6],
        ['Kohvik tõstab kohvi hinda 10% ja alandab saiakese hinda 25%. Kui palju maksavad nüüd 3 kohvi ja 2 saiakest?', 3, '11,31', r`Kohv $2{,}7\cdot1{,}1=2{,}97$ €, saiake $1{,}6\cdot0{,}75=1{,}20$ €. $3\cdot2{,}97+2\cdot1{,}20=11{,}31$ €.`, 3],
      ] },
      { topic: 'Siinus ja koosinus kraadides (graafik)', context: r`Antud on funktsioon $f(x)=2\cos x+1$ lõigul $[0^\circ;360^\circ]$.`, grid: { ...DEG_GRID, ymin: -1.5, ymax: 3.5, stepY: 0.5 }, parts: [
        ['Joonesta funktsiooni graafik.', 3, '', r`Punktid: $(0^\circ;3)$, $(90^\circ;1)$, $(180^\circ;-1)$, $(270^\circ;1)$, $(360^\circ;3)$.`, 0],
        ['Leia funktsiooni suurim ja vähim väärtus.', 2, '3; -1', r`$-1\le\cos x\le1$, seega $-1\le2\cos x+1\le3$: suurim $3$ ($x=0^\circ$, $360^\circ$), vähim $-1$ ($x=180^\circ$).`, 2],
        ['Leia funktsiooni nullkohad.', 3, '120; 240', r`$2\cos x+1=0$, $\cos x=-0{,}5$: $x_1=120^\circ$, $x_2=360^\circ-120^\circ=240^\circ$.`, 3],
        [r`Leia vahemik, kus $f(x)<0$.`, 2, '120<x<240|(120;240)', r`Graafik on x-teljest allpool nullkohtade vahel: $120^\circ<x<240^\circ$.`, 2],
      ] },
      { topic: 'Vektorid ja sirge', context: r`Sirge $s$ läbib punkte $A(1;-2)$ ja $B(5;6)$. Antud on ka punkt $D(4;1)$.`, parts: [
        [r`Koosta sirge $s$ võrrand.`, 3, 'y=2x-4', r`$k=\dfrac{6-(-2)}{5-1}=2$; $y+2=2(x-1)$, seega $y=2x-4$.`, 4],
        [r`Leia sirge $s$ ja y-telje lõikepunkt.`, 1, '(0; -4)', r`$x=0$: $y=-4$, punkt $(0;-4)$.`, 1],
        [r`Koosta punkti $D$ läbiva ja sirgega $s$ risti oleva sirge võrrand.`, 3, 'y=-0,5x+3|y=-x/2+3|y=3-0,5x', r`Ristsirge tõus $k=-\dfrac12$: $y-1=-\dfrac12(x-4)$, $y=-0{,}5x+3$.`, 4],
        ['Leia nende kahe sirge lõikepunkt.', 2, '(2,8; 1,6)', r`$2x-4=-0{,}5x+3$, $2{,}5x=7$, $x=2{,}8$, $y=2\cdot2{,}8-4=1{,}6$: $(2{,}8;1{,}6)$.`, 3],
        [r`Leia punkti $D$ kaugus sirgest $s$.`, 1, '1,34|√1,8', r`Kaugus on lõik $D$-st lõikepunktini: $\sqrt{(4-2{,}8)^2+(1-1{,}6)^2}=\sqrt{1{,}8}\approx1{,}34$.`, 2],
      ] },
    ],
    part2: [
      { topic: 'Geomeetriline jada (tekstülesanne)', context: 'Rattalaenutuse äpi kasutajate arv kasvas igal kuul 15%. Esimesel kuul oli kasutajaid 2400.', parts: [
        ['Mitu kasutajat oli 6. kuul?', 2, '4827|4827,26', r`Geomeetriline jada $b_1=2400$, $q=1{,}15$: $b_6=2400\cdot1{,}15^5\approx4827$.`, 3],
        ['Mitu kasutajat oli esimese 6 kuu jooksul kokku (kuude summa)?', 3, '21009|21008,97', r`$S_6=\dfrac{2400(1{,}15^6-1)}{1{,}15-1}\approx21\,009$`, 4],
        ['Mitmendal kuul ületab kasutajate arv esimest korda 10 000, kui kasv jätkub samamoodi?', 3, '12', r`$2400\cdot1{,}15^{n-1}>10\,000$, $1{,}15^{n-1}>4{,}1\overline6$, $n-1>\dfrac{\lg4{,}1\overline6}{\lg1{,}15}\approx10{,}21$, seega $n-1=11$, $n=12$.`, 4],
        ['Kui kasutajate arv oleks kasvanud igal kuul 360 võrra, mitu kasutajat oleks olnud 6 kuuga kokku?', 2, '19800', r`Aritmeetiline jada $a_1=2400$, $d=360$: $S_6=\dfrac{6}{2}(2\cdot2400+5\cdot360)=3\cdot6600=19\,800$.`, 3],
      ] },
      { topic: 'Kolmnurk (koosinusteoreem)', context: 'Kolmnurkse lillepeenra küljed on 5 m, 7 m ja 8 m.', parts: [
        ['Näita, et 7 m pikkuse külje vastasnurk on 60°.', 3, '60', r`$\cos\alpha=\dfrac{5^2+8^2-7^2}{2\cdot5\cdot8}=\dfrac{40}{80}=0{,}5$, seega $\alpha=60^\circ$.`, 4],
        ['Leia peenra pindala.', 3, '17,32|10√3', r`$S=\dfrac12\cdot5\cdot8\cdot\sin60^\circ=20\cdot\dfrac{\sqrt3}{2}=10\sqrt3\approx17{,}32$ m²`, 3],
        ['Leia kolmnurga suurim nurk.', 2, '81,79|81,8', r`Suurim nurk on suurima külje (8 m) vastas: $\cos\gamma=\dfrac{25+49-64}{2\cdot5\cdot7}=\dfrac17$, $\gamma\approx81{,}79^\circ$.`, 3],
        ['Peenra ümber pannakse ääris, mille üks meeter maksab 4,50 €. Kui palju maksab ääris?', 2, '90', r`Ümbermõõt $5+7+8=20$ m; $20\cdot4{,}50=90$ €.`, 2],
      ] },
      { topic: 'Kuupfunktsioon: tuletis, ekstreemumid, puutuja', context: r`Antud on funktsioon $f(x)=-x^3+6x^2-9x+2$.`, grid: { xmin: -1, xmax: 5, ymin: -5, ymax: 5, step: 1, blank: true }, parts: [
        [r`Leia $f'(x)$.`, 1, '-3x^2+12x-9|-3x²+12x-9', r`$f'(x)=-3x^2+12x-9$`, 2],
        ['Leia funktsiooni ekstreemumpunktid ja nende liik.', 3, '(1; -2); (3; 2)', r`$-3(x^2-4x+3)=0$, $x=1$ või $x=3$. $f(1)=-1+6-9+2=-2$, $f(3)=-27+54-27+2=2$. $f'$ märk: $x<1$ miinus, $1<x<3$ pluss, $x>3$ miinus — miinimumpunkt $(1;-2)$, maksimumpunkt $(3;2)$.`, 4],
        ['Kirjuta kasvamis- ja kahanemisvahemikud.', 2, '', r`Kasvab: $1<x<3$; kahaneb: $x<1$ ja $x>3$.`, 2],
        [r`Koosta graafiku puutuja võrrand kohal $x=0$.`, 2, 'y=-9x+2|y=2-9x', r`$f(0)=2$, $f'(0)=-9$: $y=-9x+2$.`, 2],
        ['Skitseeri funktsiooni graafik.', 2, '', r`Punktid $(0;2)$, $(1;-2)$ miinimum, $(3;2)$ maksimum, $(4;-2)$; suurte $x$ korral graafik langeb.`, 0],
      ] },
      { topic: 'Parabool ja pindala integraaliga', context: r`Antud on parabool $y=x^2-2x-3$.`, grid: { xmin: -2, xmax: 4, ymin: -5, ymax: 3, step: 1, blank: true }, parts: [
        ['Leia parabooli nullkohad.', 2, '-1; 3', r`$x^2-2x-3=0$, $x=\dfrac{2\pm4}{2}$: $x=-1$ või $x=3$.`, 3],
        ['Leia parabooli haripunkt.', 2, '(1; -4)', r`$x_0=\dfrac{2}{2}=1$, $y_0=1-2-3=-4$: $(1;-4)$.`, 2],
        ['Joonesta parabool.', 2, '', 'Harud üleval; punktid (−1; 0), (0; −3), (1; −4), (2; −3), (3; 0).', 0],
        ['Arvuta parabooli ja x-teljega piiratud kujundi pindala.', 4, '32/3|10,67', r`Kujund on x-teljest allpool, seega $S=-\displaystyle\int_{-1}^{3}(x^2-2x-3)\,dx=-\left[\dfrac{x^3}{3}-x^2-3x\right]_{-1}^{3}=-\left(-9-\dfrac53\right)=\dfrac{32}{3}\approx10{,}67$`, 5],
      ] },
      { topic: 'Ruumiline keha (püramiid)', context: 'Klaaskatus on korrapärase nelinurkse püramiidi kujuline: põhiserv on 6 m ja kõrgus 4 m.', parts: [
        ['Leia külgtahu kõrgus (apoteem).', 2, '5', r`Täisnurkne kolmnurk: kõrgus $4$ ja pool põhiserva $3$: $\sqrt{4^2+3^2}=5$ m.`, 3],
        ['Leia katuse klaaspinna pindala (neli külgtahku).', 3, '60', r`$S_k=4\cdot\dfrac12\cdot6\cdot5=60$ m²`, 3],
        ['Leia püramiidi ruumala.', 2, '48', r`$V=\dfrac13\cdot6^2\cdot4=48$ m³`, 2],
        ['Leia külgtahu ja põhja vaheline nurk.', 3, '53,13|53,1', r`$\tan\varphi=\dfrac{4}{3}$, $\varphi\approx53{,}13^\circ$.`, 3],
      ] },
    ],
    self: ['Lõpetasin I osa 120 minutiga.', 'Lõpetasin II osa 150 minutiga.', 'Kirjutasin igas ülesandes lahenduskäigu.', 'Kontrollisin, kas vastus sobib teksti sisuga.', 'Tean, milliseid teemasid pean kordama.'],
  },
  {
    title: 'Proovieksam 3',
    ru: 'Пробный экзамен 3',
    can: 'Õpilane lahendab kitsa matemaatika riigieksami täisvariandi ettenähtud ajaga ja kirjutab lahenduskäigu samm-sammult.',
    part1: [
      { topic: 'Avaldise lihtsustamine', parts: [
        [r`Lihtsusta avaldis $\dfrac{a^2-9}{a^2+6a+9}\cdot\dfrac{2a+6}{a^2-3a}$.`, 3, '2/a', r`$\dfrac{(a-3)(a+3)}{(a+3)^2}\cdot\dfrac{2(a+3)}{a(a-3)}=\dfrac{2}{a}$`, 6],
        [r`Arvuta $\dfrac{4^{1{,}5}\cdot2^{-2}}{\sqrt[3]{8}}$.`, 2, '1', r`$4^{1{,}5}=\left(\sqrt4\right)^3=8$, $2^{-2}=\dfrac14$, $\sqrt[3]8=2$: $\dfrac{8\cdot\frac14}{2}=1$.`, 3],
      ] },
      { topic: 'Logaritmvõrrand ja juurvõrrand', parts: [
        [r`Lahenda võrrand $\lg(2x+6)-\lg(x-1)=1$.`, 3, '2', r`Peab olema $x>1$. $\lg\dfrac{2x+6}{x-1}=1$, $\dfrac{2x+6}{x-1}=10$, $2x+6=10x-10$, $x=2$ (sobib).`, 5],
        [r`Lahenda võrrand $\sqrt{3x+1}=x-3$.`, 2, '8', r`$3x+1=x^2-6x+9$, $x^2-9x+8=0$, $x=1$ või $x=8$. Kontroll: $x=1$: $\sqrt4=2\ne-2$ — ei sobi; $x=8$: $\sqrt{25}=5=5$ ✓.`, 4],
      ] },
      { topic: 'Protsendid', context: 'Jope hind on 160 €. Kampaania ajal on hind 25% madalam ja kliendikaardiga saab veel 10% juba alandatud hinnast.', parts: [
        ['Kui palju maksab jope kliendikaardiga?', 2, '108', r`$160\cdot0{,}75\cdot0{,}9=108$ €`, 3],
        ['Mitu protsenti on kogu allahindlus?', 2, '32,5', r`$\dfrac{160-108}{160}\cdot100\%=32{,}5\%$ (mitte $35\%$).`, 3],
        ['Pood ostis jope 80 euroga. Mitu protsenti sisseostuhinnast on kasum, kui jope müüakse kliendikaardiga?', 1, '35', r`$\dfrac{108-80}{80}\cdot100\%=35\%$`, 2],
      ] },
      { topic: 'Statistika ja tõenäosus', context: '25 õpilaselt küsiti, mitu raamatut nad kuus loevad. 4 õpilast vastas „0”, 9 õpilast „1”, 7 õpilast „2” ja 5 õpilast „3”.', parts: [
        ['Leia keskmine loetud raamatute arv.', 2, '1,52', r`$\dfrac{0\cdot4+1\cdot9+2\cdot7+3\cdot5}{25}=\dfrac{38}{25}=1{,}52$`, 2],
        ['Leia mediaan.', 1, '1', r`Järjestatult on 13. väärtus mediaan: väärtused 1.–4. on $0$, 5.–13. on $1$, seega mediaan on $1$.`, 1],
        ['Leia tõenäosus, et juhuslikult valitud õpilane loeb kuus vähemalt 2 raamatut.', 2, '0,48|12/25', r`$\dfrac{7+5}{25}=\dfrac{12}{25}=0{,}48$`, 2],
      ] },
      { topic: 'Vektorid ja sirge', context: r`Rööpküliku $ABCD$ tipud on $A(-1;-2)$, $B(5;0)$ ja $D(1;4)$.`, parts: [
        [r`Leia vektorite $\overrightarrow{AB}$ ja $\overrightarrow{AD}$ koordinaadid.`, 2, '(6; 2); (2; 6)', r`$\overrightarrow{AB}=(6;2)$, $\overrightarrow{AD}=(2;6)$.`, 2],
        [r`Leia tipu $C$ koordinaadid.`, 2, '(7; 6)', r`$\overrightarrow{BC}=\overrightarrow{AD}$: $C=(5+2;\,0+6)=(7;6)$.`, 2],
        [r`Leia nurk $BAD$.`, 3, '53,13|53,1', r`$\cos A=\dfrac{\overrightarrow{AB}\cdot\overrightarrow{AD}}{|AB|\,|AD|}=\dfrac{12+12}{\sqrt{40}\cdot\sqrt{40}}=0{,}6$, $\angle A\approx53{,}13^\circ$.`, 4],
        [r`Koosta diagonaali $AC$ sirge võrrand.`, 2, 'y=x-1', r`$k=\dfrac{6-(-2)}{7-(-1)}=1$; $y+2=x+1$, $y=x-1$.`, 3],
        ['Leia rööpküliku pindala.', 1, '32', r`$\sin A=\sqrt{1-0{,}36}=0{,}8$; $S=|AB|\cdot|AD|\cdot\sin A=40\cdot0{,}8=32$.`, 2],
      ] },
      { topic: 'Võrrand (tekstülesanne)', context: 'Linnade vahel on 180 km. Bussi keskmine kiirus on 15 km/h väiksem kui auto oma ja buss jõuab kohale 36 minutit hiljem kui auto.', parts: [
        ['Tähista tundmatu ja koosta võrrand.', 4, '', r`$v$ — auto kiirus (km/h), $v-15$ — bussi kiirus; $36$ min $=0{,}6$ h: $\dfrac{180}{v-15}-\dfrac{180}{v}=0{,}6$.`, 4],
        ['Leia auto ja bussi kiirus.', 4, '75; 60', r`Korruta $v(v-15)$-ga: $180v-180(v-15)=0{,}6v(v-15)$, $2700=0{,}6v^2-9v$, $v^2-15v-4500=0$, $D=18\,225$, $v=\dfrac{15+135}{2}=75$ (negatiivne lahend ei sobi). Auto 75 km/h, buss 60 km/h.`, 6],
        ['Kui kaua on buss teel?', 2, '3', r`$180:60=3$ h`, 2],
      ] },
      { topic: 'Aritmeetiline ja geomeetriline jada (tekstülesanne)', context: 'Mari paneb jaanuaris kogumiskontole 50 € ja igal järgmisel kuul 5 € rohkem kui eelmisel kuul.', parts: [
        ['Kui palju paneb Mari kontole detsembris?', 2, '105', r`Aritmeetiline jada $a_1=50$, $d=5$: $a_{12}=50+11\cdot5=105$ €.`, 2],
        ['Kui palju paneb Mari kontole aasta jooksul kokku?', 2, '930', r`$S_{12}=\dfrac{50+105}{2}\cdot12=930$ €`, 2],
        ['Mitme kuuga on Mari kokku pannud vähemalt 2000 €?', 3, '21', r`$\dfrac{n(100+5(n-1))}{2}\ge2000$, $n^2+19n-800\ge0$, $n\ge\dfrac{-19+\sqrt{3561}}{2}\approx20{,}3$. $S_{20}=1950$, $S_{21}=2100$: $21$ kuuga.`, 4],
        ['Jüri paneb jaanuaris samuti 50 €, kuid igal järgmisel kuul 8% rohkem kui eelmisel. Kui palju paneb Jüri kontole aastaga? Kumb kogub rohkem?', 3, '948,86', r`Geomeetriline jada $b_1=50$, $q=1{,}08$: $S_{12}=\dfrac{50(1{,}08^{12}-1)}{0{,}08}\approx948{,}86$ €. Jüri kogub $18{,}86$ € rohkem.`, 4],
      ] },
    ],
    part2: [
      { topic: 'Siinus ja koosinus kraadides (graafik)', context: r`Vaateratta kabiini kõrgus maapinnast on $h(t)=20-18\cos t$ meetrit, kus $t$ on ratta pöördenurk kraadides, $0^\circ\le t\le360^\circ$.`, grid: { ...DEG_GRID, ymin: 0, ymax: 40, stepY: 5 }, parts: [
        [r`Joonesta funktsiooni $h$ graafik.`, 3, '', r`Punktid: $(0^\circ;2)$, $(90^\circ;20)$, $(180^\circ;38)$, $(270^\circ;20)$, $(360^\circ;2)$.`, 0],
        ['Leia kabiini suurim ja väikseim kõrgus.', 2, '38; 2', r`$-1\le\cos t\le1$: suurim $20+18=38$ m ($t=180^\circ$), vähim $20-18=2$ m ($t=0^\circ$, $360^\circ$).`, 2],
        ['Millise pöördenurga korral on kabiin 29 m kõrgusel?', 3, '120; 240', r`$20-18\cos t=29$, $\cos t=-0{,}5$: $t_1=120^\circ$, $t_2=240^\circ$.`, 3],
        ['Mitme kraadi ulatuses ühest täispöördest on kabiin kõrgemal kui 29 m?', 2, '120', r`$h(t)>29$, kui $120^\circ<t<240^\circ$: $240^\circ-120^\circ=120^\circ$ (kolmandik pöördest).`, 2],
      ] },
      { topic: 'Kolmnurk (siinusteoreem)', context: 'Jõe vastaskaldal on puu P. Kaldal mõõdeti lõik AB = 50 m ning nurgad ∠PAB = 72° ja ∠PBA = 63°.', parts: [
        [r`Leia nurk $APB$.`, 1, '45', r`$180^\circ-72^\circ-63^\circ=45^\circ$`, 1],
        [r`Leia kaugus $AP$.`, 3, '63|63,00', r`Siinusteoreem: $\dfrac{AP}{\sin63^\circ}=\dfrac{50}{\sin45^\circ}$, $AP=\dfrac{50\sin63^\circ}{\sin45^\circ}\approx63{,}00$ m.`, 4],
        [r`Leia kaugus $BP$.`, 2, '67,25', r`$BP=\dfrac{50\sin72^\circ}{\sin45^\circ}\approx67{,}25$ m.`, 3],
        ['Leia jõe laius, s.t puu kaugus kaldajoonest AB.', 2, '59,92|59,9', r`Kõrgus kolmnurgas: $d=AP\cdot\sin72^\circ\approx63{,}00\cdot0{,}9511\approx59{,}92$ m.`, 3],
        [r`Leia kolmnurga $ABP$ pindala.`, 2, '1498', r`$S=\dfrac12\cdot AB\cdot d=\dfrac12\cdot50\cdot59{,}92\approx1498$ m²`, 2],
      ] },
      { topic: 'Kuupfunktsioon: tuletis, ekstreemumid, puutuja', context: r`Antud on funktsioon $f(x)=2x^3+3x^2-12x-4$.`, parts: [
        [r`Leia $f'(x)$.`, 1, '6x^2+6x-12|6x²+6x-12', r`$f'(x)=6x^2+6x-12$`, 2],
        ['Leia funktsiooni ekstreemumpunktid ja nende liik.', 3, '(-2; 16); (1; -11)', r`$6(x^2+x-2)=0$, $x=-2$ või $x=1$. $f(-2)=-16+12+24-4=16$, $f(1)=2+3-12-4=-11$. $f'$: $+,-,+$ — maksimumpunkt $(-2;16)$, miinimumpunkt $(1;-11)$.`, 4],
        ['Kirjuta kasvamis- ja kahanemisvahemikud.', 2, '', r`Kasvab: $x<-2$ ja $x>1$; kahaneb: $-2<x<1$.`, 2],
        [r`Koosta nende puutujate võrrandid, mis on paralleelsed sirgega $y=24x$.`, 4, 'y=24x-48; y=24x+77', r`$f'(x)=24$: $6x^2+6x-12=24$, $x^2+x-6=0$, $x=2$ või $x=-3$. $f(2)=16+12-24-4=0$: $y=24(x-2)=24x-48$. $f(-3)=-54+27+36-4=5$: $y=24(x+3)+5=24x+77$.`, 6],
      ] },
      { topic: 'Parabool ja pindala integraaliga', context: r`Antud on funktsioonid $f(x)=x^2-4x+5$ ja $g(x)=x+5$.`, grid: { xmin: -1, xmax: 6, ymin: -1, ymax: 11, step: 1, blank: true }, parts: [
        [r`Leia parabooli $y=f(x)$ haripunkt.`, 2, '(2; 1)', r`$x_0=\dfrac{4}{2}=2$, $f(2)=4-8+5=1$: $(2;1)$.`, 2],
        ['Joonesta mõlema funktsiooni graafik ühes teljestikus.', 2, '', 'Parabool: (0; 5), (2; 1), (4; 5), harud üleval; sirge: (0; 5) ja (5; 10).', 0],
        ['Leia graafikute lõikepunktid.', 2, '(0; 5); (5; 10)', r`$x^2-4x+5=x+5$, $x^2-5x=0$, $x=0$ või $x=5$: $(0;5)$ ja $(5;10)$.`, 3],
        ['Arvuta graafikutega piiratud kujundi pindala.', 4, '125/6|20,83', r`Sirge on ülal: $S=\displaystyle\int_0^5\big((x+5)-(x^2-4x+5)\big)dx=\int_0^5(-x^2+5x)\,dx=\left[-\dfrac{x^3}{3}+\dfrac{5x^2}{2}\right]_0^5=-\dfrac{125}{3}+\dfrac{125}{2}=\dfrac{125}{6}\approx20{,}83$`, 5],
      ] },
      { topic: 'Ruumiline keha (koonus)', context: 'Koonusekujulise telgi põhja raadius on 2 m ja telgi seina (moodustaja) kaldenurk maapinna suhtes on 50°.', parts: [
        ['Leia telgi kõrgus.', 2, '2,38', r`$h=2\cdot\tan50^\circ\approx2{,}38$ m`, 2],
        ['Leia moodustaja pikkus.', 2, '3,11', r`$l=\dfrac{2}{\cos50^\circ}\approx3{,}11$ m`, 2],
        ['Leia telgi ruumala.', 2, '9,98|9,97', r`$V=\dfrac13\pi r^2h=\dfrac13\pi\cdot4\cdot2{,}384\approx9{,}98$ m³`, 2],
        ['Leia telgi külgpindala (seinte kangas).', 2, '19,55|19,54', r`$S_k=\pi rl=\pi\cdot2\cdot3{,}111\approx19{,}55$ m²`, 2],
        ['Kanga lõikamisel läheb kaotsi 15%. Mitu ruutmeetrit kangast tuleb osta?', 2, '22,48|22,5', r`$19{,}55\cdot1{,}15\approx22{,}48$ m²`, 2],
      ] },
    ],
    self: ['Lõpetasin I osa 120 minutiga.', 'Lõpetasin II osa 150 minutiga.', 'Kirjutasin igas ülesandes lahenduskäigu.', 'Ümardasin alles lõpus ja kirjutasin ühikud.', 'Tean, milliseid teemasid pean kordama.'],
  },
];
