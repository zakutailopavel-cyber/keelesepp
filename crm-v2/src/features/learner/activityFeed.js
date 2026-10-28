// „Õpilase tegevused” (owner 2026-10-27: „учитель должен видеть всё, что и ученик, чтобы действия ученика не оставались
// неизвестными”). Pure: everything the student did that the CRM keeps, newest first — signing in, a sheet opened from
// the course on his own, started, handed in (with the result), words added and practised, „Minu vead”, homework marked
// done, lessons. Nothing is written; the teacher reads it on the student card.
const time = (value) => { const at = Date.parse(value || ''); return Number.isNaN(at) ? 0 : at; };
const day = (at) => new Date(at).toISOString().slice(0, 10);
const answered = (answers = {}) => Object.values(answers).filter((value) => value !== undefined && value !== null && String(value).trim() !== '').length;
const pctOf = (score) => (score && Number.isFinite(Number(score.pct)) ? Number(score.pct) : score?.total ? Math.round((score.correct / score.total) * 100) : null);
const LESSON = { Toimunud: 'Tund toimus', Puudus_p: 'Puudus tunnist (teatas ette)', Puudus_eta: 'Puudus tunnist (ei teatanud)' };

export function activityFeed({ words = [], assignments = [], homework = [], lessons = [], presence = null, now = Date.now(), days = 60 } = {}) {
  const since = now - days * 24 * 60 * 60 * 1000;
  const list = [];
  const push = (at, kind, text, extra = {}) => { if (at && at >= since && at <= now + 60000) list.push({ at, kind, text, ...extra }); };

  if (presence?.lastSeenAt) push(Number(presence.lastSeenAt), 'seen', 'Oli KeeleSepas sees');
  const practice = presence?.practice;
  (Array.isArray(practice?.days) ? practice.days : []).forEach((date) => push(time(`${date}T12:00:00`), 'errors', `Kordas „Minu vead”${practice.errorsDate === date && practice.errorsPct !== undefined ? ` · ${practice.errorsPct}%` : ''}`));

  // words: one line per day (added / practised)
  const wordDays = new Map();
  words.forEach((word) => {
    [['added', time(word.createdAt)], ['practised', time(word.reviewedAt)]].forEach(([what, at]) => {
      if (!at) return;
      const key = `${day(at)}|${what}`;
      const entry = wordDays.get(key) || { at, what, count: 0 };
      entry.count += 1; entry.at = Math.max(entry.at, at); wordDays.set(key, entry);
    });
  });
  wordDays.forEach((entry) => push(entry.at, 'words', entry.what === 'added' ? `Lisas ${entry.count} sõna „Minu sõnad”` : `Kordas ${entry.count} sõna`));

  assignments.forEach((item) => {
    const title = item.title || item.lessonTitle || 'Tööleht';
    const assigned = time(item.assignedAt);
    if (item.source === 'self_study') push(assigned, 'course', `Avas ise kursusel: ${title}`, { id: item.id });
    else push(assigned, 'assigned', `Sai töölehe: ${title}`, { id: item.id, by: item.assignedByName || '' });
    if (item.status === 'in_progress' && time(item.updatedAt) > assigned) push(time(item.updatedAt), 'started', `Täitis töölehte: ${title} · ${answered(item.answers)} vastust`, { id: item.id });
    if (item.completedAt) {
      const pct = pctOf(item.score);
      push(time(item.completedAt), 'done', `Esitas: ${title}${pct !== null ? ` · ${pct}%` : ''}`, { id: item.id });
    }
  });
  homework.forEach((item) => {
    if (item.status === 'Tehtud') push(time(item.submittedAt || item.updatedAt) || time(`${item.date}T12:00:00`), 'homework', `Märkis kodutöö tehtuks: ${item.task || ''}`.trim());
  });
  lessons.forEach((lesson) => {
    if (LESSON[lesson.status || 'Toimunud']) push(time(`${lesson.date}T${lesson.time || '12:00'}:00`), 'lesson', `${LESSON[lesson.status || 'Toimunud']}${lesson.topic ? `: ${lesson.topic}` : ''}`);
  });
  return list.sort((a, b) => b.at - a.at);
}

// the feed by calendar day for the card: [{ date, items }]
export function feedByDay(feed = []) {
  const out = [];
  feed.forEach((item) => {
    const date = day(item.at);
    if (out[out.length - 1]?.date !== date) out.push({ date, items: [] });
    out[out.length - 1].items.push(item);
  });
  return out;
}
