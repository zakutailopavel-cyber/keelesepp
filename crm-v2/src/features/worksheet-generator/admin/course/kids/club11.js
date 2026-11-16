// Vestlusklubi 10–12 a (owner 2026-11-15: „завтра стартует группа 11 лет, разговорный клуб … учебная программа для
// развития речи, карточки для печати, словарный запас и темы … учитель открывал и распечатывал”). Estonian as a second
// language, level A1–A2, a group of children about 11 years old (mostly Russian at home). One meeting = two lessons of
// 45 minutes with a snack between them. Owner 2026-11-15 (later): 5 modules × 4 meetings = 20 meetings; the 4th meeting of
// a module is its project / review meeting. Content per module in kids/club/module1…5.js. The children talk most of the time: cards, questions, role play,
// „Leia keegi, kes …”, games and a one-minute talk; reading and writing only support the talk.
// kids/sheets.js clubLesson turns every meeting into three sheets:
//   1 Kaardid       — word cards with pictures, question cards, role cards (and extra cards): print and cut;
//   2 Tund 1        — the words with Russian, the phrases (ask / answer), a model dialogue, matching, gaps,
//                     „Leia keegi, kes …”;
//   3 Tund 2        — the snack phrases, word order, a crossword, a plan and the one-minute talk, „Ma oskan”, the
//                     parents' note (Russian).
// The teacher's plan minute by minute (Russian) is in curriculum/kidsCurriculum.js (clubPlan).
//
// Fields: words [[word, Russian, picture]] — picture 'dog' = public/kids-art/dog.svg, 'a2:sober' =
// public/textbook-art/words/a2/sober.webp; phrases [[question, answer]] (the model answers); questions — 8 question
// cards (the last 2 need an answer with „sest”); words2 — 8 harder words [word, Russian] (teacher 2026-11-16: the
// picture words were too easy); frames — 4 sentence builders (sest / aga / siis); pair — an information-gap pair task,
// same shape as roles; find — 8 lines of „Leia keegi, kes …”; roles [title, situation, [roleA, phrasesA], [roleB, phrasesB]];
// extra [title, instruction, [[name, facts]]] — more cards (identity cards, a menu …); dialogue [[A|B, text with
// [gap]]]; gaps — sentences with [answer] (bank = the answers); order — sentences for word order; cross [[Russian clue,
// answer]]; snack — the snack phrases of the meeting; plan — the plan of the talk; talk — the one-minute talk;
// game1 / game2 — the games of lesson 1 and 2 (Russian, for the teacher); home — the parents' note (Russian).

import { MODULE_1 } from './club/module1.js';
import { MODULE_2 } from './club/module2.js';
import { MODULE_3 } from './club/module3.js';
import { MODULE_4 } from './club/module4.js';
import { MODULE_5 } from './club/module5.js';

const SNACK = ['Head isu!', 'Palun! · Aitäh!', 'Kas ma võin võtta …?', 'Kas sa tahad …?', 'Mulle maitseb … · Mulle ei maitse …'];

export const CLUB_MODULES = [MODULE_1, MODULE_2, MODULE_3, MODULE_4, MODULE_5];

export const CLUB_11 = {
  id: 'k11', level: 'Klubi 10–12 a', title: 'Vestlusklubi 10–12-aastastele (A1–A2)', minutes: 90,
  goal: 'Laps räägib eesti keeles endast, oma perest, sõpradest, koolist, päevast, hobidest, söögist ja linnast, küsib teistelt küsimusi, peab lihtsa dialoogi poes, kohvikus ja teel ning räägib ühe minuti oma teemal.',
  // the 20 meetings in order; every lesson knows its module (1–5) and its place in it (1–4)
  lessons: CLUB_MODULES.flatMap((mod, m) => mod.lessons.map((lesson, i) => ({ ...lesson, module: m + 1, moduleTitle: mod.title, moduleGoal: mod.goal, inModule: i + 1 }))),
};

export const CLUB_SNACK = SNACK;
