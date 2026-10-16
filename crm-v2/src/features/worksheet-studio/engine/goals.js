// Lesson goals of a sheet: meta.goals is a map { goalId: "Ma oskan …" }. Some stored sheets (written outside the
// constructor) keep them as a list [{ id, label }]; a goal object rendered as text crashed the student card
// (owner 2026-10-16, React error #31 on „Tööd”). Read both shapes as [id, text] pairs.
const goalText = (value) => (typeof value === 'string' ? value : String(value?.label ?? value?.text ?? ''));

export function goalEntries(goals) {
  if (Array.isArray(goals)) {
    return goals.map((goal, index) => [typeof goal === 'object' && goal?.id ? String(goal.id) : `g_${index + 1}`, goalText(goal)]);
  }
  return Object.entries(goals && typeof goals === 'object' ? goals : {}).map(([id, value]) => [id, goalText(value)]);
}
