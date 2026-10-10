/* global process */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RaamatukoguPage from './RaamatukoguPage.jsx';
import { filterResources } from './raamatukoguModel.js';
import { AUDIENCES, LEVELS, RESOURCE_TYPES, RESOURCES } from './resources.js';

const publicDir = resolve(process.cwd(), 'public');

function renderPage(path = '/library/raamatukogu') {
  render(<MemoryRouter initialEntries={[path]}><RaamatukoguPage /></MemoryRouter>);
}

describe('Raamatukogu resources', () => {
  it('has unique ids and only known types, levels and audiences', () => {
    expect(new Set(RESOURCES.map((r) => r.id)).size).toBe(RESOURCES.length);
    RESOURCES.forEach((r) => {
      expect(RESOURCE_TYPES[r.type]).toBeTruthy();
      expect(r.levels.length).toBeGreaterThan(0);
      r.levels.forEach((level) => expect(LEVELS).toContain(level));
      r.audience.forEach((key) => expect(AUDIENCES[key]).toBeTruthy());
      expect(r.license).toBeTruthy();
    });
  });

  it('hosts only files that exist in public and links everything else to https', () => {
    RESOURCES.forEach((r) => {
      if (r.access === 'file') {
        expect(r.url.startsWith('/raamatukogu/')).toBe(true);
        expect(existsSync(`${publicDir}${r.url}`)).toBe(true);
      } else {
        expect(r.url.startsWith('https://')).toBe(true);
      }
    });
  });

  it('filters by every query word, level and type', () => {
    expect(filterResources(RESOURCES, { q: 'kaanamine' }).map((r) => r.id)).toContain('ut-harjutused');
    expect(filterResources(RESOURCES, { level: 'C1' }).every((r) => r.levels.includes('C1'))).toBe(true);
    expect(filterResources(RESOURCES, { type: 'audio' }).map((r) => r.id)).toEqual(['colloquial-estonian-audio']);
    expect(filterResources(RESOURCES, { q: 'lapsed lasteaed' }).map((r) => r.id)).toEqual(['alusest']);
  });
});

describe('RaamatukoguPage', () => {
  it('shows all cards and narrows them with search', () => {
    renderPage();
    const list = screen.getByRole('list', { name: 'Allikad' });
    expect(within(list).getAllByRole('heading')).toHaveLength(RESOURCES.length);
    fireEvent.change(screen.getByLabelText('Otsi raamatukogust'), { target: { value: 'Sõnaveeb' } });
    expect(within(screen.getByRole('list', { name: 'Allikad' })).getAllByRole('heading').map((h) => h.textContent)).toEqual(['Keeleõppija Sõnaveeb', 'Sõnaveeb']);
  });

  it('offers the hosted PDF under the downloadable filter', () => {
    renderPage('/library/raamatukogu?failid=1');
    const link = screen.getByRole('link', { name: /Ava PDF/ });
    expect(link).toHaveAttribute('href', '/raamatukogu/peace-corps-estonian-ED402761.pdf');
    expect(screen.getByRole('status')).toHaveTextContent(`1 / ${RESOURCES.length} allikat`);
  });

  it('shows an empty state when nothing matches', () => {
    renderPage('/library/raamatukogu?q=zzzz');
    expect(screen.getByText('Midagi ei leitud')).toBeInTheDocument();
  });
});
