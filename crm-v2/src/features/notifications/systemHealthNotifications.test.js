import { describe, expect, it } from 'vitest';
import { systemHealthNotifications } from './notificationModel.js';

const NOW = Date.parse('2026-11-09T08:00:00Z');
const TODAY = '2026-11-09';
const iso = (minutesAgo) => new Date(NOW - minutesAgo * 60000).toISOString();
const incident = { id: 'inc_20261109073000', startedAt: iso(30), failing: ['crm', 'financeApi'], failingLabels: ['CRM', 'Finantsfunktsioon'], resolvedAt: '' };

describe('systemHealthNotifications', () => {
  it('nothing when there is no document or all is well', () => {
    expect(systemHealthNotifications({}, NOW, TODAY)).toEqual([]);
    expect(systemHealthNotifications({ current: { status: 'ok', checkedAt: iso(5), incident: null } }, NOW, TODAY)).toEqual([]);
  });

  it('an open incident is one danger item whose id is the incident (one notice per incident)', () => {
    const items = systemHealthNotifications({ current: { status: 'down', checkedAt: iso(1), incident } }, NOW, TODAY);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: 'health-down:inc_20261109073000', category: 'system', severity: 'danger', title: 'Süsteem ei vasta: CRM, Finantsfunktsioon', to: '/vead' });
    // the next check of the same incident gives the same id → the bell does not count it again
    expect(systemHealthNotifications({ current: { status: 'down', checkedAt: iso(0), incident } }, NOW, TODAY)[0].id).toBe(items[0].id);
  });

  it('a closed incident shows „Süsteem töötab jälle” for 24 h', () => {
    const lastIncident = { ...incident, resolvedAt: iso(10) };
    const items = systemHealthNotifications({ current: { status: 'ok', checkedAt: iso(1), incident: null, lastIncident } }, NOW, TODAY);
    expect(items[0]).toMatchObject({ id: 'health-ok:inc_20261109073000', severity: 'success', title: 'Süsteem töötab jälle' });
    expect(systemHealthNotifications({ current: { status: 'ok', checkedAt: iso(1), lastIncident: { ...incident, resolvedAt: iso(25 * 60) } } }, NOW, TODAY)).toEqual([]);
  });

  it('a check that stopped (> 40 min) warns once a day', () => {
    const items = systemHealthNotifications({ current: { status: 'ok', checkedAt: iso(90) } }, NOW, TODAY);
    expect(items).toEqual([expect.objectContaining({ id: `health-stale:${TODAY}`, severity: 'warning', title: 'Süsteemi kontroll ei käi' })]);
  });

  it('the morning digest: „Eile N viga — vaata Vead” only on its day and only when N > 0', () => {
    const digest = { date: TODAY, total: 12, top: [{ message: 'TypeError: a', route: '/calendar', count: 9 }, { message: 'b', route: '/x', count: 1 }] };
    const [item] = systemHealthNotifications({ digest }, NOW, TODAY);
    expect(item).toMatchObject({ id: `errors-digest:${TODAY}`, title: 'Eile 12 viga — vaata Vead', to: '/vead' });
    expect(item.detail).toContain('TypeError: a (/calendar, 9×)');
    expect(systemHealthNotifications({ digest: { ...digest, total: 0 } }, NOW, TODAY)).toEqual([]);
    expect(systemHealthNotifications({ digest: { ...digest, date: '2026-11-08' } }, NOW, TODAY)).toEqual([]);
  });
});
