import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SystemHealthCard from './SystemHealthCard.jsx';
import { healthView } from './systemHealthModel.js';

const NOW = Date.parse('2026-11-09T08:00:00Z');
const iso = (minutesAgo) => new Date(NOW - minutesAgo * 60000).toISOString();
const okDoc = {
  status: 'ok',
  checkedAt: iso(3),
  targets: { crm: { label: 'CRM', ok: true, ms: 210 }, website: { label: 'Koduleht', ok: true, ms: 120 } },
  incident: null,
  lastIncident: { id: 'inc_1', startedAt: iso(300), resolvedAt: iso(280), failing: ['crm'], failingLabels: ['CRM'] },
  history: [{ at: iso(3), ok: true, failing: [] }, { at: iso(13), ok: false, failing: ['crm'] }],
};

describe('SystemHealthCard', () => {
  it('green: „Kõik töötab”, when checked, every part, the last incident', async () => {
    render(<SystemHealthCard service={{ current: vi.fn(async () => okDoc) }} now={() => NOW} />);
    expect(await screen.findByText('Kõik töötab')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Süsteemi olek' })).toHaveClass('system-health--ok');
    expect(screen.getByText('kontrollitud 3 min tagasi')).toBeInTheDocument();
    expect(screen.getByText('210 ms')).toBeInTheDocument();
    expect(screen.getByText(/Viimane rike: CRM/)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Viimased 2 kontrolli: 1 ebaõnnestus' })).toBeInTheDocument();
  });

  it('red while an incident is open', async () => {
    const down = { ...okDoc, status: 'down', incident: { id: 'inc_2', startedAt: iso(20), failing: ['website'], failingLabels: ['Koduleht'], resolvedAt: '' }, targets: { website: { label: 'Koduleht', ok: false, error: 'HTTP 502' } } };
    render(<SystemHealthCard service={{ current: vi.fn(async () => down) }} now={() => NOW} />);
    expect(await screen.findByText('Ei vasta: Koduleht')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Süsteemi olek' })).toHaveClass('system-health--down');
    expect(screen.getByText('HTTP 502')).toBeInTheDocument();
  });

  it('no document yet, a failed read and a stopped check are said plainly', async () => {
    expect(healthView(null, NOW).title).toBe('Kontroll pole veel käinud');
    expect(healthView({ ...okDoc, checkedAt: iso(120) }, NOW).tone).toBe('stale');
    render(<SystemHealthCard service={{ current: vi.fn(async () => { throw new Error('permission-denied'); }) }} now={() => NOW} />);
    expect(await screen.findByText('Olekut ei saanud lugeda')).toBeInTheDocument();
  });
});
