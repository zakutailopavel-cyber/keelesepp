// Coverage of the practice items against the course grammar plan (docs/PRACTICE_ENGINE.md „Coverage”): how many items a
// level has per type and grammar point, and which planned points have too few — those are gaps to fill in the course,
// never with invented sentences here. Pure.
import { GRAMMAR_PLAN } from '../../worksheet-generator/admin/course/grammarPlan.js';
import { grammarLabel, planPoints } from './grammar.js';
import { sentenceKey } from './lesson.js';

// fewer items than two lessons' worth of focus items is a gap
export const GAP_BELOW = 16;

const countBy = (list, key) => list.reduce((acc, x) => { const k = key(x); acc[k] = (acc[k] || 0) + 1; return acc; }, {});

export function coverageOf(course, items) {
  const byType = countBy(items, (it) => it.type);
  const byGrammar = {};
  items.forEach((it) => it.grammar.forEach((g) => { byGrammar[g] = (byGrammar[g] || 0) + 1; }));
  const plan = (GRAMMAR_PLAN[course] || []).map((p) => {
    const points = planPoints(p.id);
    const count = items.filter((it) => it.grammar.some((g) => points.includes(g))).length;
    return { id: p.id, label: p.label, count, gap: count < GAP_BELOW };
  });
  return {
    course,
    total: items.length,
    sentences: new Set(items.map(sentenceKey)).size,
    explained: items.filter((it) => it.explain?.et).length,
    untagged: items.filter((it) => !it.grammar.length).length,
    byType,
    byGrammar: Object.entries(byGrammar).map(([id, count]) => ({ id, label: grammarLabel(id), count })).sort((a, b) => b.count - a.count),
    plan,
    gaps: plan.filter((p) => p.gap),
  };
}
