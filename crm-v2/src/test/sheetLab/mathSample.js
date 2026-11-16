// A math sheet for the lab (/sheet-lab.html?set=math): formulas in text, a riigieksam-style task, coordinate planes and geometry figures.
export const mathBlocks = () => [
  { id: 'mt-note', type: 'notice', width: 'full', span: 12, tone: 'white', data: { title: 'Meenuta', lines: 'Ruutvõrrandi $ax^2+bx+c=0$ lahendid:\n$$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$$\nHaripunkt: $x_0=-\\frac{b}{2a}$. Tuletis: $(x^n)\'=nx^{n-1}$.' } },
  {
    id: 'mt-task', type: 'mathtask', width: 'full', span: 12, tone: 'white',
    data: {
      title: 'Funktsioon ja integraal', instruction: 'Kirjuta lahenduskäik ja vastus.',
      context: 'Antud on funktsioon $f(x)=x^2-4x+3$.',
      parts: [
        { text: 'Leia funktsiooni nullkohad.', points: 2, space: 'grid', rows: 4, answer: 'x=1; x=3', solution: '$x^2-4x+3=0$, $x_1=1$, $x_2=3$.' },
        { text: 'Leia haripunkti koordinaadid.', points: 2, space: 'grid', rows: 3, answer: '(2; -1)', solution: '$x_0=2$, $f(2)=-1$.' },
        { text: 'Arvuta $x$-teljega piiratud kujundi pindala $S=\\left|\\int_1^3 f(x)\\,dx\\right|$.', points: 6, space: 'grid', rows: 8, answer: '4/3', solution: '$F(x)=\\frac{x^3}{3}-2x^2+3x$, $F(3)-F(1)=0-\\frac{4}{3}$, $S=\\frac{4}{3}$.' },
      ],
    },
  },
  { id: 'mt-graph', type: 'graph', width: 'half', span: 6, tone: 'white', data: { caption: '$y=x^2-4x+3$ ja pindala', fns: 'y = x^2 - 4x + 3', points: 'A(1; 0)\nB(3; 0)\nH(2; -1)', shade: 'x^2-4x+3 | 0; 1; 3', xmin: -1, xmax: 5, ymin: -2, ymax: 4, step: 1 } },
  { id: 'mt-sin', type: 'graph', width: 'half', span: 6, tone: 'white', data: { caption: '$y=\\sin x$, $0^\\circ\\le x\\le 360^\\circ$', fns: 'sin(x)\ncos(x)', xmin: -30, xmax: 390, ymin: -1.5, ymax: 1.5, step: 30, stepY: 0.5, labelEvery: 3, angle: 'deg' } },
  { id: 'mt-blank', type: 'graph', width: 'half', span: 6, tone: 'white', data: { caption: 'Joonesta siia graafik.', blank: true, xmin: -5, xmax: 5, ymin: -5, ymax: 5, step: 1 } },
  { id: 'mt-geo-tri', type: 'geofigure', width: 'half', span: 6, tone: 'white', data: { kind: 'triangle', caption: 'Koosinusteoreem: leia külg $c$.', names: 'A B C', a: '5', b: '7', gamma: '60', sideA: 'a = 5', sideB: 'b = 7', sideC: 'c = ?', angleC: 'γ = 60°', height: 'C', heightLabel: 'h_c' } },
  { id: 'mt-geo-right', type: 'geofigure', width: 'half', span: 6, tone: 'white', data: { kind: 'triangle', caption: 'Täisnurkne kolmnurk ja mediaan.', a: '3', b: '4', right: 'C', sideA: 'a = 3', sideB: 'b = 4', sideC: 'c = ?', angleA: 'α', median: 'C', medianLabel: 'm_c' } },
  { id: 'mt-geo-circle', type: 'geofigure', width: 'half', span: 6, tone: 'white', data: { kind: 'circle', caption: 'Ringi sektor ja kõõl.', central: 110, radius: 'r = 6', chord: 'AB = ?', angle: 'α = 110°', sector: true } },
  { id: 'mt-geo-pyr', type: 'geofigure', width: 'half', span: 6, tone: 'white', data: { kind: 'solid', solid: 'pyramid', caption: 'Korrapärane nelinurkne püramiid.', names: 'A B C D S O', a: 'a = 6', H: 'H = 4', k: 'k = ?', triangle: 'k' } },
  { id: 'mt-geo-cone', type: 'geofigure', width: 'half', span: 6, tone: 'white', data: { kind: 'solid', solid: 'cone', caption: 'Koonus: $s^2=H^2+r^2$.', r: 'r = 3', H: 'H = 4', s: 's = ?', triangle: 's' } },
  { id: 'mt-geo-box', type: 'geofigure', width: 'half', span: 6, tone: 'white', data: { kind: 'solid', solid: 'cuboid', caption: 'Risttahuka ruumidiagonaal.', aLen: 6, bLen: 4, hLen: 3, a: 'a = 6', b: 'b = 4', H: 'c = 3', d: 'd = ?', triangle: 'd' } },
  { id: 'mt-geo-poly', type: 'geofigure', width: 'half', span: 6, tone: 'white', data: { kind: 'polygon', caption: 'Kolmnurk $ABC$ koordinaattasandil.', points: 'A(0;0) B(4;0) C(4;3)', lengths: true, coords: true } },
  { id: 'mt-choice', type: 'choice', width: 'half', span: 6, tone: 'white', data: { title: 'Vali õige tuletis.', instruction: '', questions: [{ q: '$f(x)=x^3-2x$, $f\'(x)=$', options: '*$3x^2-2$\n$3x^2$\n$x^2-2$' }] } },
];
