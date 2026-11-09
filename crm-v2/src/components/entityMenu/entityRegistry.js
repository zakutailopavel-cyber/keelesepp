import { ACCESS, rolesForRoute } from '../../app/accessPolicy.js';
import { hasAnyRole } from '../../utils/roles.js';

/*
 * The right-click menu's single source of truth (owner 2026-11-02: „правая кнопка мыши … везде и на всем, чтобы это
 * можно было редактировать в рамках прав учителей, админа и бухгалтера”): entity type → actions → who may use them.
 *
 * An element says what it is with `data-entity="<type>"` plus its ids as data attributes (React `data-lesson-id` →
 * `dataset.lessonId`). A student is also found from `data-student-id` or a link to `/students/<id>` (the older
 * convention). Sheets and task blocks are marked by the shared sheet renderer: `data-entity="sheet" data-lesson-id
 * data-worksheet-id` and, inside it, `data-entity="block" data-block-id`.
 *
 * An action is one of
 *   - `to(d, ctx)`: opens an existing screen; `route` is that screen's pattern in `ROUTE_ACCESS`, so a menu never
 *     offers a page the role cannot open;
 *   - `press`: clicks the row's own button marked `data-entity-action="<press>"` (the row's existing handler runs —
 *     no new back-end operation), shown only when that button is there and enabled;
 *   - `copy(d, record)`: copies a text; `kind: 'rename' | 'archive' | 'restore'`: the student card's own service calls;
 *     `kind: 'drawer'`: the student's full card in the side drawer over the current page (StudentDrawer.jsx).
 * `roles` (default: the type's roles) and the route's roles must both allow the user. `when(d, record)` hides an
 * action that does not apply. A new entity type is one entry here.
 */

const enc = encodeURIComponent;
const STAFF = ACCESS.STAFF;
const FINANCE = ACCESS.FINANCE;

const phoneOf = (record) => record?.parentPhone || record?.phone || '';
const emailOf = (record) => record?.parentEmail || record?.email || '';
const origin = () => globalThis.location?.origin || '';

// the studio of a sheet: a roadmap lesson's Avasta / Harjuta / Kasuta / Õpik sheet, or an older one-sheet lesson
export function sheetPath(d, params = {}) {
  if (!d?.lessonId) return '';
  const base = d.worksheetId
    ? `/library/lessons/${enc(d.lessonId)}/worksheets/${enc(d.worksheetId)}`
    : `/library/worksheets/${enc(d.lessonId)}`;
  const query = new globalThis.URLSearchParams(Object.entries(params).filter(([, value]) => value));
  return query.toString() ? `${base}?${query}` : base;
}
const sheetRoute = (d) => (d.worksheetId ? '/library/lessons/:lessonId/worksheets/:worksheetId' : '/library/worksheets/:lessonId');
// opened from the Õpik: the studio's back button leads to the book
const backFrom = (ctx) => (String(ctx?.pathname || '').startsWith('/library/worksheets/book') ? 'opik' : '');

const studentLinks = [
  // the card opens in the side drawer over this page (owner 2026-11-09); the full page stays one click away inside it
  { id: 'student-card', label: 'Õpilase kaart (siinsamas)', icon: 'user', route: '/students/:studentId', when: (d) => Boolean(d.studentId), kind: 'drawer' },
  { id: 'student-board', label: 'Ava tahvel', icon: 'board', route: '/board/:studentId', when: (d) => Boolean(d.studentId), to: (d) => `/board/${enc(d.studentId)}` },
  { id: 'student-write', label: 'Kirjuta õpilasele', icon: 'message', roles: STAFF, route: '/messages', when: (d) => Boolean(d.studentId), to: (d) => `/messages?student=${enc(d.studentId)}` },
];

export const ENTITY_TYPES = Object.freeze({
  student: {
    label: 'Õpilane',
    roles: STAFF,
    load: (d, services) => services.students?.getById?.(d.studentId),
    title: (d, record) => record?.name || d.entityTitle || 'Õpilane',
    subtitle: (d, record) => (record ? [record.level, record.teacher, record.active === false ? 'arhiivis' : ''].filter(Boolean).join(' · ') : 'Laen…'),
    actions: [
      { id: 'open', label: 'Ava kaart (siinsamas)', icon: 'user', route: '/students/:studentId', kind: 'drawer' },
      { id: 'open-page', label: 'Ava kaart eraldi lehel', icon: 'open', route: '/students/:studentId', to: (d) => `/students/${enc(d.studentId)}` },
      { id: 'rename', label: 'Nimeta ümber', icon: 'rename', kind: 'rename', needsRecord: true },
      { id: 'edit', label: 'Muuda andmeid', icon: 'edit', route: '/students/:studentId', to: (d) => `/students/${enc(d.studentId)}?edit=1` },
      { id: 'write', label: 'Kirjuta', icon: 'message', route: '/messages', to: (d) => `/messages?student=${enc(d.studentId)}` },
      { id: 'calendar', label: 'Kalender (õpilase tunnid)', icon: 'calendar', route: '/calendar', to: (d) => `/calendar?student=${enc(d.studentId)}` },
      { id: 'new-sheet', label: 'Koosta tööleht', icon: 'newSheet', route: '/students/:studentId/worksheets/:lessonId', to: (d) => `/students/${enc(d.studentId)}/worksheets/new` },
      { id: 'board', label: 'Ava tahvel', icon: 'board', route: '/board/:studentId', to: (d) => `/board/${enc(d.studentId)}` },
      { id: 'finance', label: 'Finantsid', icon: 'money', roles: FINANCE, route: '/students/:studentId', to: (d) => `/students/${enc(d.studentId)}?tab=finance` },
      { id: 'copy-phone', label: (d, record) => `Kopeeri telefon (${phoneOf(record)})`, icon: 'copy', when: (d, record) => Boolean(phoneOf(record)), copy: (d, record) => phoneOf(record) },
      { id: 'copy-email', label: 'Kopeeri e-post', icon: 'copy', when: (d, record) => Boolean(emailOf(record)), copy: (d, record) => emailOf(record) },
      { id: 'restore', label: 'Taasta arhiivist', icon: 'restore', kind: 'restore', when: (d, record) => record?.active === false && !record.deletedAt && !record.purgedAt },
      { id: 'archive', label: 'Arhiveeri', icon: 'archive', kind: 'archive', danger: true, when: (d, record) => Boolean(record) && record.active !== false && !record.deletedAt },
      // „Prügikast” (administrator 2026-11-03): the card's own „Kustuta” window (7 days in the trash, then purged)
      { id: 'delete', label: 'Kustuta (prügikasti)', icon: 'trash', roles: ACCESS.ADMIN, danger: true, route: '/students/:studentId', when: (d, record) => Boolean(record) && !record.deletedAt && !record.purgedAt, to: (d) => `/students/${enc(d.studentId)}?kustuta=1` },
    ],
  },

  sheet: {
    label: 'Tööleht',
    roles: STAFF,
    applies: (d) => Boolean(d.lessonId),
    actions: [
      { id: 'edit', label: 'Muuda lehte', icon: 'edit', route: sheetRoute, to: (d, ctx) => sheetPath(d, { tagasi: d.worksheetId ? backFrom(ctx) : '' }) },
      { id: 'view', label: 'Ava õpilase vaates', icon: 'view', route: sheetRoute, when: (d) => Boolean(d.worksheetId), to: (d, ctx) => sheetPath(d, { vaade: 'opilane', tagasi: backFrom(ctx) }) },
      { id: 'copy-link', label: 'Kopeeri lehe link', icon: 'link', copy: (d) => `${origin()}${sheetPath(d)}` },
    ],
  },

  block: {
    label: 'Ülesanne',
    roles: STAFF,
    // the block's sheet ids come from the nearest sheet around it (entityAt merges them)
    applies: (d) => Boolean(d.lessonId && d.blockId),
    actions: [
      { id: 'edit-block', label: 'Muuda ülesannet', icon: 'edit', route: sheetRoute, to: (d, ctx) => sheetPath(d, { plokk: d.blockId, tagasi: d.worksheetId ? backFrom(ctx) : '' }) },
      { id: 'edit-sheet', label: 'Muuda kogu lehte', icon: 'sheet', route: sheetRoute, to: (d, ctx) => sheetPath(d, { tagasi: d.worksheetId ? backFrom(ctx) : '' }) },
      { id: 'copy-link', label: 'Kopeeri ülesande link', icon: 'link', copy: (d) => `${origin()}${sheetPath(d, { plokk: d.blockId })}` },
    ],
  },

  lesson: {
    label: 'Tund',
    roles: STAFF,
    actions: [
      { id: 'open', label: 'Ava tund', icon: 'open', press: 'open' },
      { id: 'done', label: 'Märgi toimunuks', icon: 'check', press: 'done' },
      ...studentLinks,
      { id: 'student-lessons', label: 'Õpilase tunnid kalendris', icon: 'calendar', route: '/calendar', when: (d) => Boolean(d.studentId), to: (d) => `/calendar?student=${enc(d.studentId)}` },
    ],
  },

  invoice: {
    label: 'Arve',
    roles: FINANCE,
    actions: [
      { id: 'payment', label: 'Lisa makse', icon: 'money', press: 'payment' },
      { id: 'tokens', label: 'Lisa paketi tunnid', icon: 'check', press: 'tokens' },
      { id: 'print', label: 'Prindi / PDF', icon: 'print', press: 'print' },
      { id: 'send', label: 'Saada arve e-postiga', icon: 'send', press: 'send' },
      { id: 'remind', label: 'Saada meeldetuletus', icon: 'mail', press: 'remind' },
      { id: 'edit', label: 'Muuda tähtaega / krediteeri', icon: 'edit', press: 'edit' },
      { id: 'note', label: 'Märkus', icon: 'note', press: 'note' },
      { id: 'copy-number', label: 'Kopeeri arve number', icon: 'copy', when: (d) => Boolean(d.invoiceNumber), copy: (d) => d.invoiceNumber },
      { id: 'student-finance', label: 'Õpilase finantsid', icon: 'user', route: '/students/:studentId', when: (d) => Boolean(d.studentId), to: (d) => `/students/${enc(d.studentId)}?tab=finance` },
      { id: 'cancel', label: 'Tühista arve', icon: 'archive', danger: true, press: 'cancel' },
    ],
  },

  'library-item': {
    label: 'Õppematerjal',
    roles: STAFF,
    actions: [
      { id: 'details', label: 'Ava kirjeldus', icon: 'open', press: 'details' },
      { id: 'view', label: 'Vaata', icon: 'view', press: 'view' },
      { id: 'edit', label: 'Muuda', icon: 'edit', press: 'edit' },
      { id: 'opik', label: 'Ava Õpik', icon: 'sheet', press: 'opik' },
      { id: 'assign', label: 'Määra õpilastele', icon: 'send', press: 'assign' },
      { id: 'favorite', label: 'Lemmik (lisa / eemalda)', icon: 'star', press: 'favorite' },
    ],
  },

  homework: {
    label: 'Kodutöö',
    roles: STAFF,
    actions: [
      { id: 'open', label: 'Ava töö', icon: 'open', press: 'open' },
      { id: 'preview', label: 'Eelvaade', icon: 'view', press: 'preview' },
      { id: 'toggle', label: 'Märgi tehtuks / ootele', icon: 'check', press: 'toggle' },
      ...studentLinks,
    ],
  },

  group: {
    label: 'Grupp',
    roles: STAFF,
    actions: [
      { id: 'open', label: 'Ava grupp', icon: 'open', press: 'open' },
      { id: 'fill', label: 'Täida vabad kohad', icon: 'user', roles: ACCESS.ADMIN, press: 'fill' },
    ],
  },

  teacher: {
    label: 'Õpetaja',
    roles: ACCESS.ADMIN,
    actions: [
      { id: 'open', label: 'Ava profiil', icon: 'open', route: '/teachers/:teacherId', to: (d) => `/teachers/${enc(d.teacherUid)}` },
      { id: 'calendar', label: 'Õpetaja kalender', icon: 'calendar', route: '/calendar', to: (d) => `/calendar?teacher=${enc(d.teacherUid)}` },
      { id: 'copy-email', label: 'Kopeeri e-post', icon: 'copy', when: (d) => Boolean(d.email), copy: (d) => d.email },
      { id: 'delete', label: 'Kustuta (prügikasti)', icon: 'trash', danger: true, route: '/teachers/:teacherId', to: (d) => `/teachers/${enc(d.teacherUid)}?kustuta=1` },
    ],
  },

  lead: {
    label: 'Päring',
    roles: ACCESS.LEADS,
    actions: [
      { id: 'contacted', label: 'Märgi kontakteerituks', icon: 'check', press: 'contacted' },
      { id: 'convert', label: 'Õppijaks', icon: 'user', press: 'convert' },
      { id: 'copy-email', label: 'Kopeeri e-post', icon: 'copy', when: (d) => Boolean(d.email), copy: (d) => d.email },
      { id: 'copy-phone', label: (d) => `Kopeeri telefon (${d.phone})`, icon: 'copy', when: (d) => Boolean(d.phone), copy: (d) => d.phone },
    ],
  },
});

const STUDENT_LINK = /^\/students\/([^/?#]+)\/?(?:[?#].*)?$/;

// the student a right-click points at: an element with data-student-id, or a link to the student's card
export function studentIdAt(target) {
  const marked = target?.closest?.('[data-student-id]');
  if (marked?.dataset?.studentId) return marked.dataset.studentId;
  const link = target?.closest?.('a[href]');
  const match = String(link?.getAttribute('href') || '').match(STUDENT_LINK);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * What a right-click points at: the nearest element marked `data-entity`, or a student link / `data-student-id`
 * element inside it (a student's name inside a lesson block opens the student menu). Returns
 * `{ type, element, data }` or null. A block also carries the ids of the sheet around it.
 */
export function entityAt(target) {
  const element = target?.closest?.('[data-entity]') || null;
  const studentLink = target?.closest?.('a[href]');
  const linked = studentLink && STUDENT_LINK.test(String(studentLink.getAttribute('href') || '')) ? studentLink : null;
  const studentMarked = target?.closest?.('[data-student-id]') || null;
  // a student link deeper than the entity wins (a name in an invoice row is still the student)
  if (linked && (!element || element.contains(linked)) && element !== linked) {
    return { type: 'student', element: linked, data: { studentId: studentIdAt(linked) } };
  }
  if (studentMarked?.dataset?.studentId && element && element !== studentMarked && element.contains(studentMarked)) {
    return { type: 'student', element: studentMarked, data: { ...studentMarked.dataset } };
  }
  if (element && ENTITY_TYPES[element.dataset.entity]) {
    const data = { ...element.dataset };
    if (data.entity === 'block') {
      const sheet = element.parentElement?.closest?.('[data-entity="sheet"]');
      if (sheet) for (const [key, value] of Object.entries(sheet.dataset)) if (!(key in data)) data[key] = value;
    }
    return { type: data.entity, element, data };
  }
  if (studentMarked?.dataset?.studentId) return { type: 'student', element: studentMarked, data: { ...studentMarked.dataset } };
  return null;
}

// the row's own button behind a `press` action (or the row itself when it is that button)
export function pressTarget(element, name) {
  if (!element || !name) return null;
  const selector = `[data-entity-action="${name}"]`;
  const button = element.matches?.(selector) ? element : element.querySelector?.(selector);
  if (!button || button.disabled || button.getAttribute('aria-disabled') === 'true') return null;
  return button;
}

function allowed(action, type, roles, data) {
  if (!hasAnyRole(roles, action.roles || type.roles)) return false;
  const route = typeof action.route === 'function' ? action.route(data) : action.route;
  if (route && !hasAnyRole(roles, rolesForRoute(route))) return false;
  return true;
}

/**
 * The actions a user may use on an entity, in menu order. `roles` are the user's roles; `record` the loaded
 * document (a student); `element` the marked element (for `press` actions); `ctx.pathname` the current page.
 * A student / parent gets nothing (their pages keep the browser's menu).
 */
export function actionsFor(typeName, roles = [], data = {}, { record = null, element = null } = {}) {
  const type = ENTITY_TYPES[typeName];
  if (!type || !roles?.length) return [];
  if (!hasAnyRole(roles, type.roles)) return [];
  if (type.applies && !type.applies(data)) return [];
  return type.actions.filter((action) => {
    if (!allowed(action, type, roles, data)) return false;
    if (action.when && !action.when(data, record)) return false;
    if (action.press && element && !pressTarget(element, action.press)) return false;
    return true;
  });
}

export const actionLabel = (action, data, record) => (typeof action.label === 'function' ? action.label(data, record) : action.label);
