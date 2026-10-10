// Topic illustrations drawn in code (docs/TEXTBOOK_ART_BIBLE.md palette and line style): every lesson that has no
// commissioned picture gets a still life of three topic objects on the pale-lime blob — the main object carries the
// one lime accent. Objects are chosen from the lesson title, then the module title. The images and their briefs
// (art/visuals/topic-art.json) are written by `WRITE_TOPIC_ART=1 npx vitest run src/features/worksheet-generator/art/topicArt.test.js`.
const LINE = '#1E1E1E';
const PAPER = '#FFFFFF';
const ACCENT = '#C9F03D';
const BLOB = '#E8F9B0';
const GREY = '#D9D9D9';

// each object is drawn in a 100 × 100 box; `a` = fill of the accent part (lime on the main object, white elsewhere)
const OBJECTS = {
  bubbles: { name: 'jutumullid', draw: (a) => `<path d="M20 46 L16 60 L32 46z" fill="${a}"/><rect x="6" y="10" width="58" height="38" rx="9" fill="${a}"/><circle cx="23" cy="29" r="2.5" fill="${LINE}"/><circle cx="35" cy="29" r="2.5" fill="${LINE}"/><circle cx="47" cy="29" r="2.5" fill="${LINE}"/><path d="M80 76 L86 90 L68 76z" fill="${PAPER}"/><rect x="38" y="44" width="56" height="34" rx="9" fill="${PAPER}"/><line x1="50" y1="57" x2="82" y2="57"/><line x1="50" y1="66" x2="72" y2="66"/>` },
  form: { name: 'ankeet', draw: (a) => `<rect x="14" y="8" width="72" height="86" rx="6" fill="${PAPER}"/><line x1="26" y1="22" x2="74" y2="22"/><rect x="24" y="34" width="12" height="12" fill="${a}"/><path d="M26 40 l4 4 l7 -9" fill="none"/><line x1="44" y1="40" x2="74" y2="40"/><rect x="24" y="54" width="12" height="12" fill="${PAPER}"/><line x1="44" y1="60" x2="70" y2="60"/><rect x="24" y="74" width="12" height="12" fill="${PAPER}"/><line x1="44" y1="80" x2="66" y2="80"/>` },
  clock: { name: 'kell', draw: (a) => `<circle cx="50" cy="52" r="40" fill="${a}"/><circle cx="50" cy="52" r="32" fill="${PAPER}"/><line x1="50" y1="24" x2="50" y2="29"/><line x1="78" y1="52" x2="73" y2="52"/><line x1="50" y1="80" x2="50" y2="75"/><line x1="22" y1="52" x2="27" y2="52"/><line x1="50" y1="52" x2="50" y2="33"/><line x1="50" y1="52" x2="64" y2="60"/><circle cx="50" cy="52" r="3" fill="${LINE}"/>` },
  calendar: { name: 'kalender', draw: (a) => `<rect x="10" y="18" width="80" height="72" rx="6" fill="${PAPER}"/><path d="M10 36 V24 a6 6 0 0 1 6 -6 h68 a6 6 0 0 1 6 6 V36z" fill="${a}"/><line x1="30" y1="10" x2="30" y2="26"/><line x1="70" y1="10" x2="70" y2="26"/>${[46, 60, 74].map((y) => [22, 40, 58, 76].map((x) => `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="1" fill="${x === 58 && y === 60 ? LINE : PAPER}"/>`).join('')).join('')}` },
  house: { name: 'maja', draw: (a) => `<rect x="66" y="20" width="10" height="20" fill="${PAPER}"/><rect x="18" y="46" width="64" height="46" fill="${PAPER}"/><polygon points="8,50 50,14 92,50" fill="${a}"/><rect x="44" y="64" width="14" height="28" fill="${GREY}"/><rect x="26" y="58" width="12" height="12" fill="${PAPER}"/><line x1="32" y1="58" x2="32" y2="70"/><rect x="66" y="58" width="10" height="12" fill="${PAPER}"/>` },
  mappin: { name: 'kaardinõel', draw: (a) => `<path d="M18 74 L38 66 L62 74 L84 66 L84 92 L62 98 L38 90 L18 98z" fill="${GREY}"/><path d="M50 84 C50 84 22 54 22 36 a28 28 0 0 1 56 0 C78 54 50 84 50 84z" fill="${a}"/><circle cx="50" cy="36" r="10" fill="${PAPER}"/>` },
  bus: { name: 'buss', draw: (a) => `<rect x="10" y="18" width="80" height="58" rx="10" fill="${a}"/><rect x="18" y="28" width="26" height="18" rx="3" fill="${PAPER}"/><rect x="56" y="28" width="26" height="18" rx="3" fill="${PAPER}"/><line x1="10" y1="56" x2="90" y2="56"/><circle cx="18" cy="64" r="3" fill="${PAPER}"/><circle cx="82" cy="64" r="3" fill="${PAPER}"/><circle cx="28" cy="78" r="8" fill="${PAPER}"/><circle cx="72" cy="78" r="8" fill="${PAPER}"/>` },
  cup: { name: 'kohvitass', draw: (a) => `<ellipse cx="46" cy="86" rx="36" ry="6" fill="${PAPER}"/><path d="M70 44 h6 a10 10 0 0 1 0 20 h-6" fill="none"/><path d="M22 36 h48 v28 a18 18 0 0 1 -18 18 h-12 a18 18 0 0 1 -18 -18z" fill="${a}"/><path d="M36 26 q-6 -8 0 -16" fill="none"/><path d="M52 26 q-6 -8 0 -16" fill="none"/>` },
  plate: { name: 'taldrik söögiriistadega', draw: (a) => `<ellipse cx="52" cy="56" rx="32" ry="28" fill="${PAPER}"/><ellipse cx="52" cy="56" rx="20" ry="17" fill="${a}"/><line x1="10" y1="30" x2="10" y2="90"/><line x1="5" y1="30" x2="5" y2="42"/><line x1="15" y1="30" x2="15" y2="42"/><path d="M5 42 q5 6 10 0" fill="none"/><path d="M92 30 q-6 14 0 28 v32" fill="none"/>` },
  bag: { name: 'ostukott', draw: (a) => `<path d="M36 34 v-8 a14 14 0 0 1 28 0 v8" fill="none"/><path d="M18 34 h64 l6 56 h-76z" fill="${a}"/><line x1="36" y1="34" x2="36" y2="42"/><line x1="64" y1="34" x2="64" y2="42"/>` },
  coins: { name: 'mündid', draw: (a) => `<rect x="12" y="52" width="52" height="30" fill="${GREY}"/><ellipse cx="38" cy="82" rx="26" ry="8" fill="${GREY}"/><rect class="ns" x="12" y="52" width="52" height="30" fill="${GREY}"/><line x1="12" y1="52" x2="12" y2="82"/><line x1="64" y1="52" x2="64" y2="82"/><ellipse cx="38" cy="52" rx="26" ry="8" fill="${PAPER}"/><line x1="12" y1="64" x2="20" y2="66"/><line x1="64" y1="64" x2="56" y2="66"/><circle cx="72" cy="34" r="22" fill="${a}"/><path d="M80 26 a11 11 0 1 0 0 16" fill="none"/><line x1="62" y1="31" x2="76" y2="31"/><line x1="62" y1="37" x2="76" y2="37"/>` },
  receipt: { name: 'kviitung', draw: (a) => `<path d="M24 8 h52 v84 l-6.5 -6 -6.5 6 -6.5 -6 -6.5 6 -6.5 -6 -6.5 6 -6.5 -6 -6.5 6z" fill="${PAPER}"/><line x1="32" y1="22" x2="68" y2="22"/><line x1="32" y1="32" x2="60" y2="32"/><line x1="32" y1="42" x2="64" y2="42"/><line x1="32" y1="52" x2="56" y2="52"/><rect x="30" y="62" width="40" height="12" fill="${a}"/>` },
  phone: { name: 'telefon', draw: (a) => `<rect x="28" y="6" width="44" height="88" rx="8" fill="${PAPER}"/><rect x="33" y="16" width="34" height="60" rx="2" fill="${a}"/><rect x="37" y="24" width="20" height="8" rx="3" fill="${PAPER}"/><rect x="43" y="38" width="20" height="8" rx="3" fill="${PAPER}"/><rect x="37" y="52" width="16" height="8" rx="3" fill="${PAPER}"/><circle cx="50" cy="85" r="3.5" fill="${PAPER}"/>` },
  laptop: { name: 'sülearvuti', draw: (a) => `<rect x="18" y="16" width="64" height="46" rx="4" fill="${PAPER}"/><rect x="24" y="22" width="52" height="34" fill="${a}"/><path d="M8 66 h84 l-6 14 h-72z" fill="${PAPER}"/><line x1="42" y1="72" x2="58" y2="72"/>` },
  heart: { name: 'süda', draw: (a) => `<path d="M50 88 C20 66 8 48 8 32 a20 20 0 0 1 42 -10 a20 20 0 0 1 42 10 c0 16 -12 34 -42 56z" fill="${a}"/><polyline points="14,48 32,48 38,36 46,62 54,40 60,48 86,48" fill="none"/>` },
  pills: { name: 'ravimipudel', draw: (a) => `<rect x="30" y="8" width="40" height="14" rx="3" fill="${GREY}"/><rect x="24" y="22" width="52" height="70" rx="8" fill="${PAPER}"/><rect x="24" y="40" width="52" height="30" fill="${a}"/><path d="M50 46 v18 M41 55 h18" fill="none"/>` },
  medbag: { name: 'arstikohver', draw: (a) => `<path d="M36 30 v-10 h28 v10" fill="none"/><rect x="10" y="30" width="80" height="58" rx="8" fill="${PAPER}"/><path d="M44 44 h12 v10 h10 v12 h-10 v10 h-12 v-10 h-10 v-12 h10z" fill="${a}"/>` },
  book: { name: 'avatud raamat', draw: (a) => `<path d="M50 26 C38 18 22 18 10 22 v58 c12 -4 28 -4 40 4z" fill="${PAPER}"/><path d="M50 26 C62 18 78 18 90 22 v58 c-12 -4 -28 -4 -40 4z" fill="${a}"/><line x1="50" y1="26" x2="50" y2="84"/><line x1="18" y1="36" x2="42" y2="34"/><line x1="18" y1="46" x2="42" y2="44"/><line x1="18" y1="56" x2="36" y2="55"/><line x1="58" y1="34" x2="82" y2="36"/><line x1="58" y1="44" x2="82" y2="46"/>` },
  pencil: { name: 'pliiats', draw: (a) => `<g transform="rotate(-40 50 50)"><rect x="8" y="42" width="10" height="16" rx="2" fill="${GREY}"/><rect x="18" y="42" width="54" height="16" fill="${a}"/><line x1="18" y1="50" x2="72" y2="50"/><polygon points="72,42 90,50 72,58" fill="${PAPER}"/><polygon points="84,47.3 90,50 84,52.7" fill="${LINE}"/></g>` },
  clipboard: { name: 'kontrollnimekiri', draw: (a) => `<rect x="12" y="12" width="76" height="84" rx="7" fill="${a}"/><rect x="18" y="22" width="64" height="68" rx="3" fill="${PAPER}"/><rect x="36" y="8" width="28" height="12" rx="3" fill="${GREY}"/><rect x="24" y="32" width="14" height="14" rx="2" fill="${a}"/><path d="M27 39 l4 4 l7 -9" fill="none"/><line x1="46" y1="39" x2="74" y2="39"/><rect x="24" y="52" width="14" height="14" rx="2" fill="${PAPER}"/><path d="M27 59 l4 4 l7 -9" fill="none"/><line x1="46" y1="59" x2="70" y2="59"/><rect x="24" y="72" width="14" height="14" rx="2" fill="${PAPER}"/><line x1="46" y1="79" x2="66" y2="79"/>` },
  envelope: { name: 'ümbrik ja kiri', draw: (a) => `<rect x="20" y="12" width="60" height="46" fill="${a}"/><line x1="28" y1="24" x2="64" y2="24"/><line x1="28" y1="34" x2="56" y2="34"/><path d="M10 38 h80 v46 h-80z" fill="${PAPER}"/><path d="M10 38 L50 66 L90 38" fill="none"/>` },
  ticket: { name: 'pilet', draw: (a) => `<path d="M8 30 h84 v12 a8 8 0 0 0 0 16 v12 h-84 v-12 a8 8 0 0 0 0 -16z" fill="${a}"/><line x1="66" y1="32" x2="66" y2="68" stroke-dasharray="4 6"/><line x1="20" y1="44" x2="54" y2="44"/><line x1="20" y1="56" x2="44" y2="56"/>` },
  note: { name: 'noodid', draw: (a) => `<path d="M46 74 V24 L86 14 V64" fill="none"/><path d="M46 36 L86 26" fill="none"/><ellipse cx="34" cy="74" rx="12" ry="10" fill="${a}"/><ellipse cx="74" cy="64" rx="12" ry="10" fill="${PAPER}"/>` },
  masks: { name: 'teatrimaskid', draw: (a) => `<path d="M46 34 h40 v24 a20 22 0 0 1 -40 0z" fill="${PAPER}"/><path d="M56 46 q4 -4 8 0 M70 46 q4 -4 8 0 M58 64 q8 -6 16 0" fill="none"/><path d="M14 18 h40 v24 a20 22 0 0 1 -40 0z" fill="${a}"/><path d="M22 30 q4 -4 8 0 M38 30 q4 -4 8 0 M24 44 q10 8 20 0" fill="none"/>` },
  ball: { name: 'jalgpall', draw: (a) => `<circle cx="50" cy="50" r="40" fill="${PAPER}"/><polygon points="50,36 63,46 58,62 42,62 37,46" fill="${a}"/><line x1="50" y1="36" x2="50" y2="11"/><line x1="63" y1="46" x2="87" y2="40"/><line x1="58" y1="62" x2="72" y2="82"/><line x1="42" y1="62" x2="28" y2="82"/><line x1="37" y1="46" x2="13" y2="40"/>` },
  plant: { name: 'taim', draw: (a) => `<line x1="50" y1="72" x2="50" y2="28"/><path d="M50 50 C30 50 20 36 22 24 C38 24 50 34 50 50z" fill="${a}"/><path d="M50 40 C66 40 78 28 76 14 C60 14 50 24 50 40z" fill="${a}"/><path d="M50 62 C64 62 74 54 74 44 C62 42 52 50 50 62z" fill="${PAPER}"/><path d="M30 70 h40 l-6 24 h-28z" fill="${GREY}"/>` },
  bulb: { name: 'lambipirn', draw: (a) => `<path d="M50 10 a28 28 0 0 1 16 51 v9 h-32 v-9 A28 28 0 0 1 50 10z" fill="${a}"/><path d="M42 56 v-12 l8 8 l8 -8 v12" fill="none"/><rect x="36" y="72" width="28" height="8" rx="2" fill="${PAPER}"/><rect x="40" y="80" width="20" height="8" rx="2" fill="${PAPER}"/><line x1="10" y1="34" x2="2" y2="32"/><line x1="90" y1="34" x2="98" y2="32"/><line x1="20" y1="12" x2="14" y2="6"/><line x1="80" y1="12" x2="86" y2="6"/>` },
  chart: { name: 'diagramm', draw: (a) => `<rect x="22" y="60" width="14" height="28" fill="${GREY}"/><rect x="42" y="44" width="14" height="44" fill="${PAPER}"/><rect x="62" y="26" width="14" height="62" fill="${a}"/><polyline points="12,10 12,88 94,88" fill="none"/><polyline points="20,52 46,36 68,18 86,10" fill="none"/>` },
  globe: { name: 'maakera', draw: (a) => `<circle cx="50" cy="50" r="40" fill="${a}"/><ellipse cx="50" cy="50" rx="18" ry="40" fill="none"/><line x1="10" y1="50" x2="90" y2="50"/><path d="M17 30 h66 M17 70 h66" fill="none"/>` },
  suitcase: { name: 'kohver', draw: (a) => `<path d="M38 30 v-10 h24 v10" fill="none"/><rect x="12" y="30" width="76" height="56" rx="8" fill="${a}"/><line x1="30" y1="30" x2="30" y2="86"/><line x1="70" y1="30" x2="70" y2="86"/><circle cx="24" cy="91" r="4" fill="${PAPER}"/><circle cx="76" cy="91" r="4" fill="${PAPER}"/>` },
  briefcase: { name: 'portfell', draw: (a) => `<path d="M36 32 v-10 h28 v10" fill="none"/><rect x="10" y="32" width="80" height="54" rx="6" fill="${a}"/><line x1="10" y1="56" x2="90" y2="56"/><rect x="44" y="50" width="12" height="12" rx="2" fill="${PAPER}"/>` },
  people: { name: 'kaks inimest', draw: (a) => `<circle cx="68" cy="40" r="12" fill="${PAPER}"/><path d="M48 92 a20 22 0 0 1 40 0z" fill="${GREY}"/><circle cx="36" cy="34" r="14" fill="${PAPER}"/><path d="M12 92 a24 26 0 0 1 48 0z" fill="${a}"/>` },
  frame: { name: 'pildiraam', draw: (a) => `<rect x="12" y="10" width="76" height="82" rx="4" fill="${PAPER}"/><rect x="20" y="18" width="60" height="60" fill="${a}"/><circle cx="40" cy="40" r="8" fill="${PAPER}"/><path d="M26 78 a14 16 0 0 1 28 0z" fill="${PAPER}"/><circle cx="62" cy="46" r="7" fill="${PAPER}"/><path d="M50 78 a12 14 0 0 1 24 0z" fill="${PAPER}"/>` },
  newspaper: { name: 'ajaleht', draw: (a) => `<rect x="12" y="14" width="76" height="76" rx="3" fill="${PAPER}"/><rect x="20" y="22" width="60" height="9" fill="${LINE}"/><rect x="20" y="40" width="28" height="22" fill="${a}"/><line x1="54" y1="42" x2="80" y2="42"/><line x1="54" y1="51" x2="80" y2="51"/><line x1="54" y1="60" x2="74" y2="60"/><line x1="20" y1="72" x2="80" y2="72"/><line x1="20" y1="81" x2="70" y2="81"/>` },
  mic: { name: 'mikrofon', draw: (a) => `<path d="M26 42 v4 a24 24 0 0 0 48 0 v-4" fill="none"/><line x1="50" y1="70" x2="50" y2="86"/><line x1="34" y1="88" x2="66" y2="88"/><rect x="36" y="8" width="28" height="48" rx="14" fill="${a}"/><line x1="36" y1="26" x2="64" y2="26"/><line x1="36" y1="36" x2="64" y2="36"/>` },
  building: { name: 'asutuse hoone', draw: (a) => `<rect x="8" y="80" width="84" height="10" fill="${PAPER}"/>${[18, 36, 56, 74].map((x) => `<rect x="${x}" y="42" width="8" height="38" fill="${PAPER}"/>`).join('')}<rect x="12" y="34" width="76" height="8" fill="${PAPER}"/><polygon points="8,34 50,10 92,34" fill="${a}"/>` },
  ballot: { name: 'valimiskast', draw: (a) => `<rect x="40" y="12" width="22" height="38" fill="${a}"/><path d="M45 26 l5 5 l8 -10" fill="none"/><rect x="18" y="44" width="64" height="46" rx="3" fill="${PAPER}"/><line x1="36" y1="44" x2="66" y2="44"/><line x1="30" y1="66" x2="70" y2="66"/>` },
  magnifier: { name: 'luup', draw: (a) => `<g transform="rotate(45 74 74)"><rect x="66" y="60" width="16" height="34" rx="6" fill="${GREY}"/></g><circle cx="42" cy="42" r="30" fill="${a}"/><circle cx="42" cy="42" r="21" fill="${PAPER}"/><path d="M30 36 a14 14 0 0 1 12 -8" fill="none"/>` },
  shield: { name: 'kilp', draw: (a) => `<path d="M50 8 L86 22 V48 C86 70 70 84 50 92 C30 84 14 70 14 48 V22z" fill="${a}"/><path d="M34 50 l12 12 l22 -24" fill="none"/>` },
  bolt: { name: 'välk', draw: (a) => `<polygon points="58,6 20,56 46,56 36,94 80,40 54,40 66,6" fill="${a}"/>` },
  chip: { name: 'kiip', draw: (a) => `${[36, 50, 64].map((p) => `<line x1="${p}" y1="26" x2="${p}" y2="14"/><line x1="${p}" y1="74" x2="${p}" y2="86"/><line x1="26" y1="${p}" x2="14" y2="${p}"/><line x1="74" y1="${p}" x2="86" y2="${p}"/>`).join('')}<rect x="26" y="26" width="48" height="48" rx="6" fill="${a}"/><rect x="38" y="38" width="24" height="24" rx="3" fill="${PAPER}"/>` },
  puzzle: { name: 'pusletükid', draw: (a) => `<g transform="translate(34 30) scale(.62)"><path d="M10 26 h24 a10 10 0 0 1 20 0 h24 v24 a10 10 0 0 0 0 20 v24 h-68z" fill="${PAPER}"/></g><g transform="translate(4 4) scale(.62)"><path d="M10 26 h24 a10 10 0 0 1 20 0 h24 v24 a10 10 0 0 0 0 20 v24 h-68z" fill="${a}"/></g>` },
  scales: { name: 'kaalud', draw: (a) => `<line x1="50" y1="18" x2="50" y2="84"/><polygon points="38,92 62,92 56,84 44,84" fill="${PAPER}"/><line x1="16" y1="26" x2="84" y2="26"/><circle cx="50" cy="18" r="5" fill="${PAPER}"/><path d="M16 26 L6 56 M16 26 L26 56" fill="none"/><path d="M4 56 h24 a12 8 0 0 1 -24 0z" fill="${a}"/><path d="M84 26 L74 50 M84 26 L94 50" fill="none"/><path d="M72 50 h24 a12 8 0 0 1 -24 0z" fill="${PAPER}"/>` },
  shirt: { name: 'särk', draw: (a) => `<path d="M50 30 v-12 a6 6 0 1 1 6 -6" fill="none"/><path d="M30 30 L12 40 L20 58 L30 54 V92 H70 V54 L80 58 L88 40 L70 30 C64 38 36 38 30 30z" fill="${a}"/><path d="M40 33 L50 44 L60 33" fill="none"/>` },
  face: { name: 'nägu', draw: (a) => `<circle cx="50" cy="50" r="38" fill="${a}"/><circle cx="37" cy="44" r="3.5" fill="${LINE}"/><circle cx="63" cy="44" r="3.5" fill="${LINE}"/><path d="M34 60 q16 14 32 0" fill="none"/><path d="M30 34 q6 -5 12 -2 M58 32 q6 -3 12 2" fill="none"/>` },
  signpost: { name: 'teeviit', draw: (a) => `<rect x="46" y="12" width="8" height="78" fill="${PAPER}"/><path d="M54 20 h30 l8 9 -8 9 h-30z" fill="${a}"/><path d="M46 46 h-30 l-8 9 8 9 h30z" fill="${PAPER}"/><line x1="26" y1="92" x2="74" y2="92"/>` },
  warning: { name: 'hoiatusmärk', draw: (a) => `<path d="M50 10 L92 84 H8z" fill="${a}"/><line x1="50" y1="36" x2="50" y2="60"/><circle cx="50" cy="72" r="3.5" fill="${LINE}"/>` },
  hourglass: { name: 'liivakell', draw: (a) => `<path d="M28 16 h44 C72 36 56 44 50 50 C44 44 28 36 28 16z" fill="${PAPER}"/><path d="M28 84 h44 C72 64 56 56 50 50 C44 56 28 64 28 84z" fill="${PAPER}"/><path d="M34 84 h32 c-4 -10 -12 -14 -16 -16 c-4 2 -12 6 -16 16z" fill="${a}"/><rect x="22" y="8" width="56" height="8" rx="2" fill="${PAPER}"/><rect x="22" y="84" width="56" height="8" rx="2" fill="${PAPER}"/>` },
  megaphone: { name: 'megafon', draw: (a) => `<path d="M30 60 l4 18 h10 l-4 -14" fill="${PAPER}"/><path d="M18 40 L66 18 V82 L18 60z" fill="${a}"/><rect x="8" y="40" width="12" height="20" rx="2" fill="${PAPER}"/><path d="M76 36 q8 14 0 28" fill="none"/><path d="M84 28 q14 22 0 44" fill="none"/>` },
  care: { name: 'hoolivad käed', draw: (a) => `<path d="M50 52 C36 42 30 34 30 26 a10 10 0 0 1 20 -4 a10 10 0 0 1 20 4 c0 8 -6 16 -20 26z" fill="${a}"/><path d="M8 62 q22 -4 42 16 v14 h-26 q-16 -6 -16 -30z" fill="${PAPER}"/><path d="M92 62 q-22 -4 -42 16 v14 h26 q16 -6 16 -30z" fill="${PAPER}"/>` },
  camera: { name: 'fotokaamera', draw: (a) => `<path d="M34 30 l6 -10 h20 l6 10" fill="${PAPER}"/><rect x="10" y="30" width="80" height="54" rx="8" fill="${PAPER}"/><circle cx="50" cy="57" r="18" fill="${a}"/><circle cx="50" cy="57" r="9" fill="${PAPER}"/><rect x="72" y="38" width="10" height="6" rx="1" fill="${GREY}"/>` },
};

// lesson / module title → objects, first match first
const RULES = [
  [/kontroll|diagnostika|hindamine|simulatsioon/, ['clipboard']],
  [/minevik|ajajoon|kogemus|eile|lugu piltide/, ['hourglass', 'camera']],
  [/partitiiv|genitiiv|kääne|käände|sihitis|infinitiiv|rektsioon|sõnajärg|lause|sidend|kesksõna|des-vorm|tegumood|kõneviis|grammatika|kirjavahemärg|asesõna|paralleelvorm|nominalisatsioon|tarind|relatiiv|kaudne kõne|refereeri|keeletäpsus/, ['puzzle', 'book']],
  [/tutvumine|viisakus|räägin|suhtlusstiil|register/, ['bubbles']],
  [/isikuandmed|ankeet|vormid|taotlus|leping|tingimus|õigused|reeglid/, ['form']],
  [/pere|lähedased|kelle oma|minu inimesed|suhted|rollid|koos veedetud/, ['frame', 'people']],
  [/välimus|iseloom|identiteet|enesepilt|emotsioon|hoiak/, ['face', 'shirt']],
  [/kell|päev|sagedus|kui tihti|harjumus|ajamäärus/, ['clock']],
  [/nädal|plaan|broneeri|kokkulepe|aja muutmine|tegevuskava|planeerimine|kohustus/, ['calendar']],
  [/kodu|korter|eluase|naabruskond/, ['house']],
  [/kus\?|kuhu|kust|kohad|linn|tee küsimine|juhatamine|ruum/, ['mappin', 'signpost']],
  [/transport|liikumis|liikuvus/, ['bus', 'mappin']],
  [/sildid|kaardid|lahtiolekuaj/, ['signpost', 'clock']],
  [/käskiv|nõuanne|nõuanded|juhised/, ['bubbles', 'signpost']],
  [/kohvik|restoran|tellimus/, ['cup', 'plate', 'receipt']],
  [/toit|toidu|jook|söök/, ['plate', 'cup']],
  [/arve|kviitung|tagastus|kampaania/, ['receipt', 'bag']],
  [/pood|kaubad|ostu|ostud|proovimine|valimine|tarbija|tarbimis/, ['bag', 'shirt']],
  [/arvud|hinnad|kogused|raha|eelarve|säästa|kulutada|rahandus|pangandus|kindlustus/, ['coins', 'receipt']],
  [/telefon|klienditeenindus/, ['phone', 'bubbles']],
  [/teenus|asjaajamine|ametiasutus|institutsioon/, ['building', 'form']],
  [/kaebus|probleem|pretensioon|vaidlus|ootamatu|valesti|kriis|risk/, ['warning']],
  [/arst|ravim|vastuvõtu|patsient|tervishoiu/, ['medbag', 'pills']],
  [/keha|enesetunne|valutab|sümptom|tervis|heaolu|eluviis|ennetus|stress|koormus/, ['heart', 'ball']],
  [/hooldus|sotsiaalne tugi|vabatahtlik|vananemine|demograaf/, ['care', 'hourglass']],
  [/hobi|vaba aeg|meeldib|üritus|pilet|kultuuris osalemine|meelelahutus/, ['ticket', 'note', 'ball']],
  [/film|teater|kirjandus|tõlgendus|arvustus|kultuur/, ['masks', 'book']],
  [/kutse|kiri|pöördumine|kirjalik suhtlus/, ['envelope', 'pencil']],
  [/reis/, ['suitcase', 'globe']],
  [/töö|karjäär|värbamine|kvalifikatsioon|kontor|koosolek|juhtimine|meeskond|organisatsioon|pädevus/, ['briefcase', 'laptop']],
  [/õppimine|õpi|haridus|õpe|motivatsioon|loeng|konspekt|oskused/, ['book', 'bulb']],
  [/info|allika|usaldusväärsus|faktikontroll|fakt|valeinfo|meedia|kriitiline|autori/, ['newspaper', 'magnifier']],
  [/analüüs|süntees|kokkuvõte|lugemine/, ['magnifier', 'book']],
  [/arvamus|seisukoht|nõustumine|argument|debatt|põhjend|järeldus|väide|tõend/, ['bubbles', 'scales']],
  [/kompromiss|läbirääkimi|tasakaal|võrdlemine|kahe lahenduse|eetika|dilemma|huvide/, ['scales']],
  [/konflikt|piiride/, ['warning', 'bubbles']],
  [/keskkond|kliima|keskkonnasõbralik|kestlik|maa/, ['plant', 'globe']],
  [/energia|ressurss/, ['bolt', 'plant']],
  [/tehnoloogia|digi|sotsiaalmeedia|tehisintellekt|tehisaru/, ['chip', 'laptop', 'phone']],
  [/statistika|andmed/, ['chart']],
  [/kogukond|osalemine|kodanikuosalus|ühiskond|sidusus|mitmekesisus|avalik otsustus|avalik elu/, ['people', 'ballot']],
  [/ettekanne|monoloog|rääkimine|eneseväljendus/, ['mic', 'bubbles']],
  [/kirjutamine|parandamine|arvamusteksti|tekst/, ['pencil', 'book']],
  [/ettepanek|lahendus|innovatsioon|teadus/, ['bulb']],
  [/reklaam|sõnum|kommunikatsioon|kriisiinfo/, ['megaphone']],
  [/turvalisus/, ['shield']],
  [/keel|mitmekeelne|vahendamine|kuuluvus/, ['globe', 'bubbles']],
  [/väärtused|valikud|prioriteedid|otsus/, ['signpost', 'scales']],
  [/tulevik|stsenaarium|ebakindlus/, ['signpost', 'bulb']],
  [/igapäevaelu|lähtepunkt|eneseinfo/, ['clock', 'house', 'bubbles']],
];
const FALLBACK = ['book', 'bubbles', 'pencil'];

const fold = (text) => String(text || '').toLocaleLowerCase('et');
const keysFor = (text) => RULES.filter(([re]) => re.test(fold(text))).flatMap(([, keys]) => keys);

// three different objects: the lesson's own topic first, then its module, then a neutral fallback; `turn` rotates
// the side objects so the lessons of one module do not look alike
export function objectsForLesson({ title, moduleTitle, turn = 0 }) {
  const own = [...new Set(keysFor(title))];
  const pool = [...new Set([...own, ...keysFor(moduleTitle), ...FALLBACK])];
  const main = own[0] || pool[0];
  const rest = pool.filter((key) => key !== main);
  const shift = rest.length ? turn % rest.length : 0;
  const sides = [...rest.slice(shift), ...rest.slice(0, shift)].slice(0, 2);
  return [main, ...sides];
}

// a small deterministic random from a string
function rng(seedText) {
  let h = 2166136261;
  for (const ch of String(seedText)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

function blobPath(cx, cy, rx, ry, random) {
  const n = 8;
  const pts = Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    const k = 0.82 + random() * 0.3;
    return [cx + Math.cos(t) * rx * k, cy + Math.sin(t) * ry * k];
  });
  const at = (i) => pts[(i + n) % n];
  let d = `M${at(0)[0].toFixed(1)} ${at(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}z`;
}

const sprig = (x, y, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><path d="M0 0 C0 -40 8 -70 20 -96" fill="none"/><path d="M4 -34 C-22 -40 -30 -60 -26 -74 C-6 -70 4 -54 4 -34z" fill="${GREY}"/><path d="M10 -60 C34 -64 44 -84 40 -98 C20 -96 10 -80 10 -60z" fill="${GREY}"/><path d="M2 -12 C26 -14 36 -28 34 -40 C16 -40 4 -28 2 -12z" fill="${PAPER}"/></g>`;
const star = (x, y, s) => `<path d="M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}z" fill="${PAPER}"/>`;

// a 1200 × 800 (3:2) still life of three objects, the first with the lime accent
export function sceneSvg(keys, seedText = keys.join('-')) {
  const random = rng(seedText);
  const [main, left, right] = keys.map((key) => OBJECTS[key] || OBJECTS.book);
  const place = (obj, x, y, size, accent) => `<g transform="translate(${x} ${y}) scale(${size / 100})">${obj.draw(accent ? ACCENT : PAPER)}</g>`;
  const lift = Math.round(random() * 30);
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">',
    `<style>*{vector-effect:non-scaling-stroke}g,path,rect,circle,ellipse,line,polyline,polygon{stroke:${LINE};stroke-width:5;stroke-linecap:round;stroke-linejoin:round}.ns{stroke:none}</style>`,
    `<rect class="ns" width="1200" height="800" fill="${PAPER}"/>`,
    `<path class="ns" d="${blobPath(600, 440, 420, 300, random)}" fill="${BLOB}"/>`,
    star(250 + Math.round(random() * 60), 130 + Math.round(random() * 40), 18),
    star(920 + Math.round(random() * 60), 110 + Math.round(random() * 40), 13),
    `<circle cx="${1060 + Math.round(random() * 40)}" cy="280" r="7" fill="${PAPER}"/>`,
    `<circle cx="${110 + Math.round(random() * 40)}" cy="300" r="5" fill="${PAPER}"/>`,
    `<line x1="90" y1="690" x2="1110" y2="690"/>`,
    sprig(110, 690, false),
    sprig(1090, 690, true),
    place(left, 150, 400 - lift, 290, false),
    place(right, 770, 380 + lift, 290, false),
    place(main, 385, 250, 430, true),
    '</svg>',
  ].join('');
}

export const objectNames = (keys) => keys.map((key) => (OBJECTS[key] || OBJECTS.book).name);
export const OBJECT_KEYS = Object.keys(OBJECTS);

const PROMPTS = {
  A2: ['Mis esemed on pildil?', 'Kuidas need on seotud tunni teemaga?', 'Ütle paarilisele 2 lauset.'],
  B1: ['Mis on pildil?', 'Millist olukorda need esemed meenutavad?', 'Räägi paarilisega oma kogemusest.'],
  B2: ['Kuidas pilt tunni teemaga seostub?', 'Milline ese on teema jaoks kõige olulisem ja miks?', 'Sõnasta pildi põhjal üks arutlusküsimus.'],
  C1: ['Milliseid seoseid näed esemete ja tunni teema vahel?', 'Mida pilt jätab ütlemata?', 'Sõnasta pildi põhjal väide ja vastuväide.'],
};
const JOBS = {
  A2: 'name the objects and connect them to the lesson topic in 2 sentences',
  B1: 'describe the objects and tell a related personal experience',
  B2: 'infer the topic and argue which object matters most',
  C1: 'interpret what the picture says and leaves unsaid; formulate a claim and a counter-claim',
};
const PHASE_WORD = { discover: 'avasta', practice: 'harjuta', transfer: 'kasuta' };

// the brief for one lesson (TEXTBOOK_ART_BIBLE §6) — drawn in code, so no cast and no text in the image
export function topicBrief({ lessonId, title, moduleTitle, band, phase, turn }) {
  const keys = objectsForLesson({ title, moduleTitle, turn });
  const names = objectNames(keys);
  return {
    id: `${lessonId}-${PHASE_WORD[phase]}-1`,
    phase,
    format: 'scene',
    ext: 'svg',
    objects: keys,
    cast: [],
    scene: `Natüürmort: ${names.join(', ')}.`,
    accent: names[0],
    text: [],
    learningJob: JOBS[band] || JOBS.B1,
    prompts: PROMPTS[band] || PROMPTS.B1,
    alt: `Joonistus: ${names.join(', ')}.`,
    caption: `Pilt. ${String(title).replace(/^Grammatika:\s*/, '')}`,
  };
}
