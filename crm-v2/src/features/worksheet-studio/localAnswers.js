// A copy of the learner's answers on this device (Fable review 2026-11-11, U4): without network a save or „Esita” fails,
// and closing the sheet used to lose the work. The copy is written on every change and read when the sheet opens again;
// the newer of the copy and the stored answers wins. Cleared once the sheet is submitted. localStorage may be missing
// or full (private mode): then the sheet works as before, only without the copy.

const PREFIX = 'keelesepp.worksheetAnswers.';

function store() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

// recordings not yet uploaded (blob:) and check marks (':error') mean nothing after a reload
export function cleanAnswers(answers) {
  return Object.fromEntries(Object.entries(answers || {}).filter(([key, value]) => !key.endsWith(':error') && !(typeof value === 'string' && value.startsWith('blob:'))));
}

export function saveLocalAnswers(assignmentId, answers, now = new Date()) {
  if (!assignmentId) return;
  try { store()?.setItem(PREFIX + assignmentId, JSON.stringify({ answers: cleanAnswers(answers), savedAt: now.toISOString() })); } catch { /* full or blocked */ }
}

export function readLocalAnswers(assignmentId) {
  if (!assignmentId) return null;
  try {
    const value = JSON.parse(store()?.getItem(PREFIX + assignmentId) || 'null');
    return value && typeof value.answers === 'object' && value.answers ? value : null;
  } catch { return null; }
}

export function clearLocalAnswers(assignmentId) {
  if (!assignmentId) return;
  try { store()?.removeItem(PREFIX + assignmentId); } catch { /* blocked */ }
}

// The answers a sheet opens with. `restored` is true when the device copy is newer than the stored answers (it is then
// saved again by the player). A submitted sheet always shows what was submitted; a read-only look never uses the copy.
export function startAnswers(assignment, { readOnly = false } = {}) {
  const stored = assignment?.answers || {};
  if (!assignment?.id || readOnly) return { answers: stored, restored: false };
  if (assignment.status === 'done') { clearLocalAnswers(assignment.id); return { answers: stored, restored: false }; }
  const local = readLocalAnswers(assignment.id);
  if (!local || !Object.keys(local.answers).length) return { answers: stored, restored: false };
  const storedAt = isoOf(assignment.updatedAt);
  if (storedAt && String(local.savedAt || '') <= storedAt) return { answers: stored, restored: false };
  return { answers: local.answers, restored: true };
}

function isoOf(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  try { return (typeof value.toDate === 'function' ? value.toDate() : new Date(value)).toISOString(); } catch { return ''; }
}
