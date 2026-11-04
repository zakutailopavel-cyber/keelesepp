// „Vead” (admin): records of `clientErrors` grouped by fingerprint. A group's status: an admin's „Teada” wins over
// new records (a known error does not nag again); „Parandatud” + a newer record = „new” again (it came back).
export const DAY_MS = 24 * 60 * 60 * 1000;

export const KIND_LABELS = Object.freeze({
  error: 'Lehe viga',
  rejection: 'Lõpetamata päring',
  render: 'Leht kukkus kokku',
  permission: 'Ligipääs keelati',
  call: 'Videokõne',
  media: 'Kaamera / mikrofon',
});

export const STATUS_LABELS = Object.freeze({ new: 'Uus', ack: 'Teada', fixed: 'Parandatud' });

const topValues = (counts, limit = 3) => [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).slice(0, limit).map(([value]) => value);

export function groupErrors(records = []) {
  const groups = new Map();
  for (const record of records) {
    const key = record.fingerprint || record.id;
    if (!groups.has(key)) groups.set(key, { fingerprint: key, records: [] });
    groups.get(key).records.push(record);
  }
  return [...groups.values()].map(({ fingerprint, records: list }) => {
    const latest = list.reduce((best, item) => (item.lastAt > best.lastAt ? item : best), list[0]);
    const statuses = new Set(list.map((item) => item.status));
    const lastFixed = Math.max(0, ...list.filter((item) => item.status === 'fixed').map((item) => item.lastAt));
    const newRecords = list.filter((item) => item.status === 'new');
    let status = 'fixed';
    if (newRecords.length) status = statuses.has('ack') ? 'ack' : 'new';
    else if (statuses.has('ack')) status = 'ack';
    const routes = new Map();
    const browsers = new Map();
    const builds = new Map();
    for (const item of list) {
      if (item.route) routes.set(item.route, (routes.get(item.route) || 0) + item.count);
      if (item.browser) browsers.set(item.browser, (browsers.get(item.browser) || 0) + item.count);
      if (item.build) builds.set(item.build, (builds.get(item.build) || 0) + item.count);
    }
    return {
      fingerprint,
      message: latest.message,
      kind: latest.kind,
      frame: latest.frame,
      status,
      cameBack: status === 'new' && lastFixed > 0 && newRecords.some((item) => item.lastAt > lastFixed),
      count: list.reduce((sum, item) => sum + (item.count || 1), 0),
      users: new Set(list.map((item) => item.uid).filter(Boolean)).size,
      roles: [...new Set(list.map((item) => item.role).filter(Boolean))].sort(),
      firstAt: Math.min(...list.map((item) => item.firstAt || item.lastAt)),
      lastAt: latest.lastAt,
      routes: topValues(routes),
      browsers: topValues(browsers),
      builds: topValues(builds, 2),
      ids: list.map((item) => item.id),
      newIds: newRecords.map((item) => item.id),
    };
  }).sort((a, b) => b.lastAt - a.lastAt);
}

export function filterGroups(groups, status = 'new') {
  return status === 'all' ? groups : groups.filter((group) => group.status === status);
}

// the dashboard's badge and digest: groups still „Uus” with a record in the last 24 h
export function newInLastDay(groups, now = Date.now()) {
  return groups.filter((group) => group.status === 'new' && group.lastAt >= now - DAY_MS);
}

export function agoLabel(at, now = Date.now()) {
  if (!at) return '—';
  const minutes = Math.max(0, Math.round((now - at) / 60000));
  if (minutes < 1) return 'just nüüd';
  if (minutes < 60) return `${minutes} min tagasi`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h tagasi`;
  return new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Tallinn' }).format(new Date(at));
}
