// Extractor: turns the course's own tasks with known right answers into practice items (docs/PRACTICE_ENGINE.md
// „Content”). Nothing is invented: every sentence, every right answer and every wrong option is the course author's
// (admin/course/<level>/module*.js — the same blocks the worksheets show). A task is skipped when its answer is not
// checkable: an open model answer („Näidisvastus on üks võimalus”), a missing key, a gap without a form cue in a
// vocabulary or reading task, an option set with no right option. Pure.
import { detectGrammar, isConnector, plannedGrammar } from './grammar.js';
import { ordersOf, sentenceOf, tilesOf } from './items.js';

export const COURSE_LEVELS = { a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1' };
export const PRACTICE_COURSES = Object.keys(COURSE_LEVELS);
const PHASES = ['discover', 'practice', 'transfer'];

// an open task: its key is one possible answer, not the answer
const OPEN_TASK = /näidisvastus|üks võimalus|oma sõnadega|vaba vastus|mitu võimalikku|võid kirjutada ka/i;
// a style rewrite (clearer, more precise, another register…): the key is a model, many other answers are right too
const STYLE_REWRITE = /selgemaks|täpsemaks|täpsem\b|konstruktiivse|konkreetse|loomuliku|iroonili|taktitundeli|registris|stiilis|nüanss|moonuta|sõnasta ümber/i;
const MAX_TILES = 16;
const MAX_TYPED_WORDS = 30;
const MAX_GAP_WORDS = 4;

const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const lines = (v) => String(v || '').split('\n').map(clean).filter(Boolean);
const alternatives = (v) => String(v || '').split(/[|;]/).map(clean).filter(Boolean);
const wordCount = (v) => clean(v).split(' ').filter(Boolean).length;
const stripMarks = (v) => clean(String(v || '').replace(/\*\*|__|\*/g, ''));

// the rule line for feedback: the item's own explanation from the teacher's key, else the lesson's „Märka” rule nearest
// before the task, else the hint sentence of the task's instruction („Mõtle, kas … ma- või da-vormis.”)
function cueOf(instruction) {
  const parts = clean(instruction).split(/(?<=[.!?])\s+/);
  return parts.find((p) => /^(mõtle|pea meeles|kontrolli|pärast|vaata|tähelepanu)/i.test(p)) || '';
}
// a notice that is a module summary or a text model is no rule line
const NOT_A_RULE = /kokkuvõte|\btekst|sõnavara|\bsõnad\b|näidis|plaan/i;
function ruleOf(notice) {
  const title = stripMarks(notice?.data?.title || '').replace(/^märka[:!.]?\s*/i, '');
  if (NOT_A_RULE.test(title)) return '';
  return title ? title.charAt(0).toUpperCase() + title.slice(1) : '';
}

const MARK = '\u0000';
// the sentence around one gap of a passage: other gaps filled with their first right answer
function sentenceAround(filledText) {
  const sentence = filledText.split(/\n+|(?<=[.!?…])\s+(?=[A-ZÕÄÖÜŠŽ„"])/).find((x) => x.includes(MARK)) || '';
  const [before, after = ''] = sentence.split(MARK);
  return { before: clean(before), after: clean(after) };
}

// „Liis lubas [rääkida] (rääkima).” → gaps with their accepts and the base-form hint in brackets after them
const GAP_PIECE = /(\[[^\]]*\](?:\s*\([^)]*\))?)/g;
function gapPieces(text) {
  let n = -1;
  return String(text || '').split(GAP_PIECE).map((piece) => {
    const m = /^\[([^\]]*)\](?:\s*\(([^)]*)\))?$/.exec(piece);
    return m ? { gap: (n += 1), accept: alternatives(m[1].replace(/;/g, '|')), base: clean(m[2] || '') } : { text: piece };
  });
}
function gapsOf(text) {
  const pieces = gapPieces(text);
  const gaps = pieces.filter((p) => 'gap' in p);
  return gaps.map((g) => {
    const filled = pieces.map((p) => ('gap' in p ? (p.gap === g.gap ? MARK : (p.accept[0] || '')) : p.text)).join('');
    const around = sentenceAround(filled);
    // „[Ära sõida] üle silla! (sõitma, eitus)” — a hint at the end of the line belongs to the gap
    const tail = /\s*\(([^)]*)\)\s*$/.exec(around.after);
    if (tail && !g.base && gaps.length === 1) return { ...g, base: clean(tail[1]), before: around.before, after: clean(around.after.slice(0, tail.index)) };
    return { ...g, ...around };
  });
}

// „{*koolist|kooli|koolile}” option gaps
const CLOZE_PIECE = /(\{[^}]*\})/g;
function clozeGapsOf(text) {
  let n = -1;
  const pieces = String(text || '').split(CLOZE_PIECE).map((piece) => {
    if (!/^\{[^}]*\}$/.test(piece)) return { text: piece };
    const opts = piece.slice(1, -1).split('|').map((o) => o.trim()).filter(Boolean);
    return { gap: (n += 1), right: opts.filter((o) => o.startsWith('*')).map((o) => clean(o.slice(1))), wrong: opts.filter((o) => !o.startsWith('*')).map(clean) };
  });
  return pieces.filter((p) => 'gap' in p).map((g) => {
    const filled = pieces.map((p) => ('gap' in p ? (p.gap === g.gap ? MARK : (p.right[0] || '')) : p.text)).join('');
    return { ...g, ...sentenceAround(filled) };
  });
}

// a grammar transformation keeps most of the sentence's words (a rewrite in other words cannot be checked by a key)
const lemmaish = (w) => w.toLocaleLowerCase('et').slice(0, 4);
function keepsWords(from, answer) {
  const a = new Set(tilesOf(answer).map(lemmaish));
  const f = tilesOf(from).map(lemmaish);
  return f.length ? f.filter((w) => a.has(w)).length / f.length >= 0.5 : false;
}
const bag = (s) => tilesOf(s).map((w) => w.toLocaleLowerCase('et')).sort().join(' ');
const sameBag = (a, b) => bag(a) === bag(b) && clean(a) !== clean(b);
const commonStart = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i += 1; return i; };
// the options are forms of one word („koolist / kooli / koolile”), not different words
function sameWordOptions(options) {
  const low = options.map((o) => o.toLocaleLowerCase('et'));
  return low.every((o) => commonStart(o, low[0]) >= Math.min(3, low[0].length - 1));
}

function makeContext(course, mod, moduleIndex, lessonId, lesson, phase) {
  return {
    course, level: COURSE_LEVELS[course], stage: lesson.level || mod.MODULE?.level || COURSE_LEVELS[course],
    moduleId: mod.MODULE?.id || '', moduleTitle: mod.MODULE?.title || '', moduleIndex, supplement: Boolean(mod.MODULE?.supplement),
    lessonId, lessonTitle: lesson.title || '', phase,
  };
}

function blockItems(ctx, block, notice) {
  const d = block.data || {};
  const instruction = clean(d.instruction);
  if (OPEN_TASK.test(instruction) || OPEN_TASK.test(d.title || '')) return [];
  const own = detectGrammar(`${d.title || ''} ${instruction}`);
  // the task's own words first, then the rule it follows („Märka: …”), then the course plan for the lesson
  const fallback = own.length ? own : detectGrammar(`${notice?.data?.title || ''}`);
  const blockGrammar = fallback.length ? fallback : plannedGrammar(ctx.course, ctx.lessonId);
  const whys = lines(d.explain);
  // an item's own explanation may name its point („Ma- ja da-vorm: peab, võib …”)
  const grammarAt = (i, hasBase = false) => {
    const found = [...new Set([...detectGrammar(whys[i] || ''), ...blockGrammar])];
    return found.length || !hasBase ? found : ['forms'];
  };
  const rule = ruleOf(notice);
  const cue = cueOf(instruction);
  const explainAt = (i) => ({ et: whys[i] || rule || cue || '' });
  const base = (i, extra) => ({
    ...ctx, id: `${ctx.lessonId}/${block.id}/${i}`, source: { blockId: block.id, blockType: block.type, index: i },
    title: clean(d.title), instruction, explain: explainAt(typeof i === 'number' ? i : Number(String(i).split('.')[0])), ...extra,
  });
  const out = [];
  const withPoint = (list, point) => [...new Set([...list, point])];

  switch (block.type) {
    case 'wordorder':
      lines(d.sentences).forEach((line, i) => {
        const tiles = tilesOf(line);
        if (tiles.length < 3 || tiles.length > MAX_TILES) return;
        const sentence = sentenceOf(line);
        out.push(base(i, { type: 'build', tiles, orders: [tiles], answers: [sentence], sentence, grammar: withPoint(grammarAt(i), 'word-order') }));
      });
      break;
    case 'transformation':
    case 'errorfix':
      (d.rows || []).forEach((row, i) => {
        const from = clean(block.type === 'errorfix' ? row.wrong : row.from);
        const answers = alternatives(row.answer);
        if (!from || !answers.length || answers.some((a) => wordCount(a) > MAX_TYPED_WORDS)) return;
        if (STYLE_REWRITE.test(`${d.title || ''} ${instruction}`) || !keepsWords(from, answers[0])) return;
        out.push(base(i, {
          type: 'transform', fix: block.type === 'errorfix', from, cue: clean(row.prompt), answers, orders: ordersOf(answers).filter((o) => o.length <= MAX_TILES),
          // a fix that only moves words is a word-order item
          sentence: answers[0], grammar: sameBag(from, answers[0]) ? withPoint(grammarAt(i), 'word-order') : grammarAt(i),
        }));
      });
      break;
    case 'wordforms':
      (d.rows || []).forEach((row, i) => {
        const answer = clean(row.answer);
        const prompt = clean(row.prompt);
        if (!answer || !clean(row.base) || wordCount(answer) > MAX_GAP_WORDS) return;
        const [before, after] = prompt.includes('…') ? prompt.split('…').map(clean) : ['', ''];
        const answers = alternatives(answer);
        out.push(base(i, {
          type: isConnector(answers[0]) ? 'connector' : 'form', before, after, cue: prompt.includes('…') ? '' : prompt, base: clean(row.base), answers, options: null,
          sentence: prompt.includes('…') ? clean(`${before} ${answers[0]} ${after}`) : `${clean(row.base)} → ${answers[0]}`, grammar: grammarAt(i, true),
        }));
      });
      break;
    case 'gaps':
    case 'formtext': {
      const text = block.type === 'gaps' ? d.sentences : d.passage;
      const rows = block.type === 'gaps' ? lines(text) : [String(text || '')];
      const bank = String(d.bank || '').split(d.bankLines ? /\n/ : /[,\n]/).map(clean).filter(Boolean);
      // a gap is grammar when it gives the base form, asks for a linking word, or the task names its grammar point
      const grammarTask = block.type === 'formtext' || own.length > 0;
      let gapIndex = -1;
      rows.forEach((row, ri) => {
        gapsOf(row).forEach((g) => {
          gapIndex += 1;
          const whyAt = block.type === 'gaps' ? ri : gapIndex;
          if (!g.accept.length || g.accept.some((a) => wordCount(a) > MAX_GAP_WORDS)) return;
          const connector = isConnector(g.accept[0]);
          // a vocabulary gap without a form cue is the word cards' job (phase 1), not grammar practice
          if (!connector && !g.base && !grammarTask) return;
          const wrong = bank.filter((w) => !g.accept.some((a) => a.toLocaleLowerCase('et') === w.toLocaleLowerCase('et')));
          const options = d.showBank !== 'no' && bank.length && wrong.length >= 2 && bank.some((w) => g.accept.includes(w)) ? [g.accept[0], ...wrong.slice(0, 3)] : null;
          const key = block.type === 'gaps' ? `${ri}.${g.gap}` : `${g.gap}`;
          const item = base(key, {
            type: connector ? 'connector' : 'form', before: g.before, after: g.after, base: g.base, answers: g.accept, options,
            sentence: clean(`${g.before} ${g.accept[0]} ${g.after}`), grammar: connector ? withPoint(grammarAt(whyAt), 'connectors') : grammarAt(whyAt, Boolean(g.base)),
          });
          // the teacher's key explains gaps line by line (gaps) or gap by gap (formtext)
          item.explain = explainAt(whyAt);
          out.push(item);
        });
      });
      break;
    }
    case 'cloze':
      clozeGapsOf(d.passage).forEach((g, gi) => {
        if (g.right.length !== 1 || g.wrong.length < 1) return;
        const options = [g.right[0], ...g.wrong];
        const connector = isConnector(g.right[0]) && g.wrong.every(isConnector);
        if (!connector && !sameWordOptions(options) && block.goal !== 'g_notice') return;
        if (options.some((o) => wordCount(o) > MAX_GAP_WORDS) || !g.before && !g.after) return;
        out.push(base(gi, {
          type: connector ? 'connector' : 'form', before: g.before, after: g.after, base: '', answers: g.right, options,
          sentence: clean(`${g.before} ${g.right[0]} ${g.after}`), grammar: connector ? withPoint(grammarAt(gi), 'connectors') : grammarAt(gi),
        }));
      });
      break;
    case 'choice':
      // only grammar choice tasks with a gap in the question (reading questions are not grammar practice)
      if (block.goal !== 'g_notice') break;
      (d.questions || []).forEach((q, i) => {
        const opts = lines(q.options);
        const right = opts.filter((o) => o.startsWith('*')).map((o) => clean(o.slice(1)));
        const wrong = opts.filter((o) => !o.startsWith('*')).map(clean);
        const text = clean(q.q);
        const gap = /…|_{2,}/.exec(text);
        if (right.length !== 1 || !wrong.length || !gap) return;
        const before = clean(text.slice(0, gap.index));
        const after = clean(text.slice(gap.index + gap[0].length));
        const connector = isConnector(right[0]) && wrong.every(isConnector);
        out.push(base(i, {
          type: connector ? 'connector' : 'form', before, after, base: '', answers: right, options: [right[0], ...wrong],
          sentence: clean(`${before} ${right[0]} ${after}`), grammar: connector ? withPoint(grammarAt(i), 'connectors') : grammarAt(i),
        }));
      });
      break;
    default:
      break;
  }
  return out;
}

// every practice item of one course (modules as courseModules.<course>.js lists them)
export function extractCourseItems(course, modules) {
  if (!COURSE_LEVELS[course]) return [];
  const items = [];
  (modules || []).forEach((mod, moduleIndex) => {
    Object.entries(mod.LESSONS || {}).forEach(([lessonId, lesson]) => {
      PHASES.forEach((phase) => {
        let notice = null;
        (lesson?.[phase] || []).forEach((block) => {
          if (block?.type === 'notice') { notice = block; return; }
          items.push(...blockItems(makeContext(course, mod, moduleIndex, lessonId, lesson, phase), block, notice));
        });
      });
    });
  });
  return items;
}

// the modules of a course as the preview lists them
export const moduleList = (modules) => (modules || []).map((mod, index) => ({ id: mod.MODULE?.id || `m${index}`, title: mod.MODULE?.title || '', index, supplement: Boolean(mod.MODULE?.supplement) }));
