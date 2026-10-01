// Pure helpers for CRM v1 interactive lessons played in CRM v2 (same rules as interactive-lesson-core.js on the server).

export const ASSIGNMENT_STATUS_LABEL = { active: 'Tegemata', submitted: 'Saadetud õpetajale', reviewed: 'Tagasiside saadud' };

export const RESPONSE_KIND_LABEL = {
  short_text: 'Lühivastus',
  long_text: 'Pikem kirjalik vastus',
  single_choice: 'Vali üks vastus',
  multiple_choice: 'Vali mitu vastust',
  gaps: 'Täida lüngad',
};

export function isAnswered(activity, value) {
  const spec = activity?.response;
  if (!spec || value === undefined || value === null) return false;
  if (spec.mode === 'short_text' || spec.mode === 'long_text') return Boolean(String(value).trim());
  if (spec.mode === 'single_choice') return value !== '';
  if (spec.mode === 'multiple_choice') return Array.isArray(value) && value.length > 0;
  return spec.items.every((item) => Boolean(String(value?.[item.id] || '').trim()));
}

export function progress(activities = [], answers = {}) {
  const fillable = activities.filter((activity) => activity.response);
  return { answered: fillable.filter((activity) => isAnswered(activity, answers[activity.id])).length, total: fillable.length };
}

// Required fillable tasks that are still empty block "Saada õpetajale" (the server checks the same).
export function missingRequired(activities = [], answers = {}) {
  return activities.filter((activity) => activity.response?.required && !isAnswered(activity, answers[activity.id]));
}

// Gaps written as "___" in the prompt are shown inline when their count matches the answer fields.
export function inlineGapParts(activity) {
  const spec = activity?.response;
  if (spec?.mode !== 'gaps') return null;
  const parts = String(activity.prompt || '').split(/_{3,}/g);
  return parts.length === spec.items.length + 1 ? parts : null;
}

export function answerText(activity, value) {
  const spec = activity?.response;
  if (!spec) return 'Suuline või õpetaja juhitud ülesanne.';
  if (value === undefined) return 'Vastust pole.';
  if (spec.mode === 'single_choice') return spec.items.find((item) => item.id === value)?.label || '—';
  if (spec.mode === 'multiple_choice') return spec.items.filter((item) => value.includes(item.id)).map((item) => item.label).join(', ') || '—';
  if (spec.mode === 'gaps') return spec.items.map((item) => `${item.label}: ${value?.[item.id] || '—'}`).join('\n');
  return String(value);
}
