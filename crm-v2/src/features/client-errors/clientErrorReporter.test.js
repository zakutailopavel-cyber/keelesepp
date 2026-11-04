import { describe, expect, it, vi } from 'vitest';
import {
  MAX_PER_SESSION, REPORTED, THROTTLE_MS, browserLabel, callErrorKind, collectionPattern, createReporter, fingerprintOf,
  installClientErrorListeners, primaryRole, sanitizeRoute, sanitizeText, topFrame,
} from './clientErrorReporter.js';

function memoryStorage() {
  const data = new Map();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) };
}

function setup({ path = '/students', ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.92 Safari/537.36' } = {}) {
  let time = Date.UTC(2026, 10, 4, 10);
  const send = vi.fn();
  const reporter = createReporter({ send, now: () => time, storage: memoryStorage(), location: { pathname: path }, navigator: { userAgent: ua }, build: 'abc1234' });
  reporter.setIdentity({ uid: 'uid-1', roles: ['teacher'] });
  return { reporter, send, advance: (ms) => { time += ms; }, at: () => time };
}

describe('sanitizing', () => {
  it('drops query strings and hashes from URLs', () => {
    expect(sanitizeText('Failed to fetch https://keelesepp.ee/tund/abc?token=SECRET123&x=1#frag now')).toBe('Failed to fetch https://keelesepp.ee/tund/abc now');
    expect(sanitizeText('at https://x.ee/a.js?v=2:1:5')).not.toContain('v=2');
  });

  it('removes e-mails, long numbers and tokens', () => {
    const text = sanitizeText('User mari.tamm@example.com phone +372 5123 4567 code 39001010123 iban EE382200221020145685 token=abc.def bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig');
    expect(text).not.toMatch(/mari|example\.com/);
    expect(text).not.toMatch(/5123|4567|39001010123|2200221020145685/);
    expect(text).not.toContain('abc.def');
    expect(text).not.toContain('eyJ');
    expect(text).toContain('[e-post]');
    expect(text).toContain('[nr]');
  });

  it('keeps short numbers and normal words, masks long ids', () => {
    expect(sanitizeText("Cannot read properties of undefined (reading 'map') at line 42")).toBe("Cannot read properties of undefined (reading 'map') at line 42");
    expect(sanitizeText('No document to update: students/aB3dE5fG7hJ9kL1mN2pQ')).toBe('No document to update: students/[id]');
  });

  it('cuts the message to 500 characters', () => {
    expect(sanitizeText('x'.repeat(900))).toHaveLength(500);
  });

  it('route: path only, ids and link tokens masked', () => {
    expect(sanitizeRoute('/students/aB3dE5fG7hJ9kL1mN2pQ?tab=finance')).toBe('/students/:id');
    expect(sanitizeRoute('/tund/x7Yt-very-secret-token#a')).toBe('/tund/:id');
    expect(sanitizeRoute('/maksa/inv1')).toBe('/maksa/:id');
    expect(sanitizeRoute('/library/worksheet-generator/avasta-module-1')).toBe('/library/worksheet-generator/avasta-module-1');
    expect(sanitizeRoute('/library/lessons/A2-M01-L03/worksheets/discover')).toBe('/library/lessons/:id/worksheets/discover');
    expect(sanitizeRoute('/x/mari%40example.com')).toBe('/x/:id');
    expect(sanitizeRoute('')).toBe('/');
  });

  it('browser label: family, major version, system', () => {
    expect(browserLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1')).toBe('Safari 17 · iPhone');
    expect(browserLabel('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0')).toBe('Edge 130 · Windows');
    expect(browserLabel('Mozilla/5.0 (Linux; Android 14) Firefox/131.0')).toBe('Firefox 131 · Android');
    expect(browserLabel('')).toBe('Muu');
  });

  it('top frame without origin and query string', () => {
    expect(topFrame('TypeError: x\n    at render (https://keelesepp.ee/assets/index-abc.js?v=1:1:2345)\n    at y (https://keelesepp.ee/assets/b.js:1:1)')).toBe('/assets/index-abc.js:1:2345');
    expect(topFrame('no frames here')).toBe('');
  });

  it('fingerprint: stable, 16 hex, ignores the column', () => {
    const a = fingerprintOf('error', 'boom', '/assets/a.js:1:20');
    expect(a).toMatch(/^[0-9a-f]{16}$/);
    expect(fingerprintOf('error', 'boom', '/assets/a.js:1:99')).toBe(a);
    expect(fingerprintOf('rejection', 'boom', '/assets/a.js:1:20')).not.toBe(a);
  });

  it('collection pattern and role', () => {
    expect(collectionPattern('students/abc/notes/def')).toBe('students/{id}/notes/{id}');
    expect(collectionPattern('/invoices/x')).toBe('invoices/{id}');
    expect(primaryRole(['student', 'teacher'])).toBe('teacher');
    expect(primaryRole([])).toBe('none');
    expect(callErrorKind({ name: 'NotAllowedError' })).toBe('media');
    expect(callErrorKind(new Error('ICE failed'))).toBe('call');
  });
});

describe('reporter', () => {
  it('sends one clean record with uid + role, never e-mail or name', () => {
    const { reporter, send } = setup({ path: '/students/aB3dE5fG7hJ9kL1mN2pQ' });
    const error = new TypeError('Failed for mari@example.com');
    error.stack = 'TypeError: x\n at f (https://keelesepp.ee/assets/index-abc.js:1:10)';
    const record = reporter.report('error', error);
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toEqual(record);
    expect(record).toMatchObject({ kind: 'error', route: '/students/:id', build: 'abc1234', role: 'teacher', uid: 'uid-1', count: 1, frame: '/assets/index-abc.js:1:10', browser: 'Chrome 130 · macOS' });
    expect(record.message).toBe('TypeError: Failed for [e-post]');
    expect(Object.keys(record).sort()).toEqual(['browser', 'build', 'count', 'fingerprint', 'firstAt', 'frame', 'kind', 'lastAt', 'message', 'role', 'route', 'uid']);
  });

  it('a plain object rejection is reported by its type only (may hold form data)', () => {
    const { reporter, send } = setup();
    reporter.report('rejection', { email: 'a@b.ee', password: 'x' });
    expect(send.mock.calls[0][0].message).toBe('Mitte-Error väärtus (object)');
  });

  it('throttles the same fingerprint to once per 10 minutes and counts the repeats', () => {
    const { reporter, send, advance } = setup();
    const boom = () => Object.assign(new Error('boom'), { stack: 'Error: boom\n at f (https://keelesepp.ee/assets/a.js:1:10)' });
    reporter.report('error', boom());
    reporter.report('error', boom());
    advance(THROTTLE_MS - 1000);
    reporter.report('error', boom());
    expect(send).toHaveBeenCalledTimes(1);
    advance(2000);
    reporter.report('error', boom());
    expect(send).toHaveBeenCalledTimes(2);
    const second = send.mock.calls[1][0];
    expect(second.count).toBe(3);
    expect(second.lastAt - second.firstAt).toBe(THROTTLE_MS + 1000);
  });

  it('sends at most 20 records per session', () => {
    const { reporter, send } = setup();
    for (let index = 0; index < 30; index += 1) reporter.report('error', new Error(`boom number ${'x'.repeat(index)}`));
    expect(send).toHaveBeenCalledTimes(MAX_PER_SESSION);
  });

  it('keeps the session state in sessionStorage (a reload does not reset the limit)', () => {
    const storage = memoryStorage();
    const send = vi.fn();
    const make = () => { const r = createReporter({ send, now: () => 1000, storage, location: { pathname: '/' }, navigator: { userAgent: '' } }); r.setIdentity({ uid: 'u', roles: ['student'] }); return r; };
    const same = new Error('same');
    make().report('error', same);
    make().report('error', same);
    expect(send).toHaveBeenCalledTimes(1);
  });

  it('ignores noise: ResizeObserver, cross-origin „Script error.”, stale build chunks, extensions', () => {
    const { reporter, send } = setup();
    reporter.report('error', 'ResizeObserver loop completed with undelivered notifications.');
    reporter.report('error', 'Script error.');
    reporter.report('rejection', new TypeError('Failed to fetch dynamically imported module: https://x/a.js'));
    reporter.report('error', new Error('ext'), { stack: 'at x (chrome-extension://abc/content.js:1:1)' });
    expect(send).not.toHaveBeenCalled();
  });

  it('waits for the signed-in identity, then sends; a guest is reported as guest', () => {
    const send = vi.fn();
    const reporter = createReporter({ send, now: () => 5, storage: memoryStorage(), location: { pathname: '/tund/secret' }, navigator: { userAgent: '' } });
    reporter.report('error', new Error('before login'));
    expect(send).not.toHaveBeenCalled();
    reporter.setGuest('guest_1');
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][0]).toMatchObject({ uid: 'guest_1', role: 'guest', route: '/tund/:id' });
  });

  it('permission denied: the collection pattern only', () => {
    const { reporter, send } = setup();
    reporter.reportPermissionDenied(['students/abc123/notes/n1', 'lessons/l1'], 'batch');
    expect(send.mock.calls[0][0]).toMatchObject({ kind: 'permission', message: 'Missing or insufficient permissions (batch lessons/{id}, students/{id}/notes/{id})' });
  });

  it('never throws, even when the sender throws', () => {
    const reporter = createReporter({ send: () => { throw new Error('offline'); }, storage: memoryStorage(), location: { pathname: '/' }, navigator: {} });
    reporter.setIdentity({ uid: 'u', roles: [] });
    expect(() => reporter.report('error', new Error('x'))).not.toThrow();
  });

  it('window listeners: error + unhandledrejection, skipping writes already reported', () => {
    const target = new globalThis.EventTarget();
    const reporter = { report: vi.fn() };
    const stop = installClientErrorListeners(target, reporter);
    const errorEvent = new globalThis.Event('error');
    Object.assign(errorEvent, { error: new Error('boom'), message: 'boom' });
    target.dispatchEvent(errorEvent);
    const plain = new globalThis.Event('unhandledrejection');
    plain.reason = new Error('rejected');
    target.dispatchEvent(plain);
    const handled = new globalThis.Event('unhandledrejection');
    const denied = new Error('Missing or insufficient permissions.');
    denied[REPORTED] = true;
    handled.reason = denied;
    target.dispatchEvent(handled);
    target.dispatchEvent(new globalThis.Event('error')); // an <img> that failed to load
    expect(reporter.report.mock.calls.map(([kind]) => kind)).toEqual(['error', 'rejection']);
    stop();
    target.dispatchEvent(errorEvent);
    expect(reporter.report).toHaveBeenCalledTimes(2);
  });
});
