// Calm home page (owner 2026-11-06: „очень много информации, которую хочется смотреть целенаправленно”). Pure helpers:
// the one short „Vajab tähelepanu” list (what to do now, most urgent first) and the „Täna” timeline split. Everything
// else lives behind the „Ülevaated” tiles and loads only when opened.

export const ATTENTION_LIMIT = 5;
export const REVIEW_LATE_DAYS = 3;
export const SOON_MINUTES = 60;
export const TIMELINE_NEXT = 3;

const DAY = 86400000;
const minutesOf = (clock) => {
  const [hours, minutes] = String(clock || '').split(':').map(Number);
  return Number.isFinite(hours) && Number.isFinite(minutes) ? hours * 60 + minutes : null;
};
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format((cents || 0) / 100);

// today's lessons running now or starting within the next hour (cancelled ones never)
export function lessonsSoon(lessons = [], clock = '00:00', minutes = SOON_MINUTES) {
  const now = minutesOf(clock) ?? 0;
  return lessons.filter((item) => item.phase === 'now' || (item.phase === 'later' && minutesOf(item.time) != null && minutesOf(item.time) - now <= minutes));
}

// works handed in and not reviewed for more than `days` days (the date the student finished it)
export function lateReviews(submissions = [], now = Date.now(), days = REVIEW_LATE_DAYS) {
  return submissions.filter((item) => {
    if (item.reviewStatus === 'reviewed') return false;
    const at = Date.parse(item.completedAt || item.submittedAt || '');
    return Number.isFinite(at) && now - at > days * DAY;
  }).length;
}

// The attention list: one line per kind of work with a count > 0, most urgent first, at most `limit` lines. A count
// left `null` (its data is not loaded or not this role's) is not shown. Each line opens the page or the tile's panel
// where the work is done. `rest` = how many kinds did not fit.
export function attentionItems({
  soon = [],
  showTeacher = true,
  unmarked = null,
  reviewsLate = null,
  overdueInvoices = null,
  overdueCents = 0,
  leads = null,
  calls = null,
  runningOut = null,
  errors = null,
  unplanned = null,
} = {}, limit = ATTENTION_LIMIT) {
  const next = soon.find((item) => item.phase === 'later') || soon[0];
  const all = [
    soon.length ? {
      key: 'soon',
      count: soon.length,
      text: `${plural(soon.length, 'tund käib', 'tundi käib')} või algab tunni jooksul`,
      detail: next ? `${next.phase === 'now' ? 'Käib' : 'Järgmine'}: ${next.time} ${next.studentName}${showTeacher && next.teacher ? ` · ${next.teacher}` : ''}` : '',
      to: next?.path || '/calendar',
      action: next?.path ? { to: next.path, label: 'Alusta tundi' } : null,
      tone: 'now',
    } : null,
    unmarked ? { key: 'unmarked', count: unmarked, text: `${plural(unmarked, 'märkimata tund', 'märkimata tundi')}`, detail: 'Möödunud tunnid ilma märketa', to: '/calendar/markimata', tone: 'danger' } : null,
    reviewsLate ? { key: 'reviews', count: reviewsLate, text: `${reviewsLate === 1 ? '1 töö ootab' : `${reviewsLate} tööd ootavad`} kontrolli üle ${REVIEW_LATE_DAYS} päeva`, detail: 'Esitatud, kuid õpetaja pole üle vaadanud', to: '/homework', tone: 'warning' } : null,
    overdueInvoices ? { key: 'invoices', count: overdueInvoices, text: `${plural(overdueInvoices, 'tähtaja ületanud arve', 'tähtaja ületanud arvet')}`, detail: `Kokku ${money(overdueCents)}`, to: '/finance?status=overdue', tone: 'danger' } : null,
    leads ? { key: 'leads', count: leads, text: `${plural(leads, 'uus veebipäring', 'uut veebipäringut')}`, detail: 'Keegi pole veel vastanud', to: '/leads', tone: 'warning' } : null,
    calls ? { key: 'calls', count: calls, text: `${calls === 1 ? '1 õpilane vajab' : `${calls} õpilast vajavad`} kõnet`, detail: 'Puudumised, tegemata kodutööd või tunnita', panel: 'calls', tone: 'warning' } : null,
    runningOut ? { key: 'balance', count: runningOut, text: `${runningOut === 1 ? '1 õpilasel lõpevad' : `${runningOut} õpilasel lõpevad`} makstud tunnid`, detail: 'Pakett või kuuarve hakkab otsa saama', panel: 'balance', tone: 'warning' } : null,
    errors ? { key: 'errors', count: errors, text: `${plural(errors, 'uus viga', 'uut viga')} saidil`, detail: 'Viimased 24 tundi', to: '/vead', linkLabel: 'Vead', tone: 'neutral' } : null,
    unplanned ? { key: 'unplanned', count: unplanned, text: `${plural(unplanned, 'õpilane', 'õpilast')} ilma tulevase tunnita`, detail: 'Lisa tund või märgi paus', to: '/calendar?unplanned=1', tone: 'neutral' } : null,
  ].filter(Boolean);
  return { items: all.slice(0, limit), rest: Math.max(0, all.length - limit) };
}

// „Täna”: the lessons still ahead (running first) and the ones over or cancelled; `next` = the first few ahead
export function timelineSplit(lessons = [], next = TIMELINE_NEXT) {
  const ahead = lessons.filter((item) => item.phase === 'now' || item.phase === 'later');
  const done = lessons.filter((item) => item.phase === 'past' || item.phase === 'cancelled');
  return { ahead, done, next: ahead.slice(0, next), total: lessons.filter((item) => item.phase !== 'cancelled').length };
}
