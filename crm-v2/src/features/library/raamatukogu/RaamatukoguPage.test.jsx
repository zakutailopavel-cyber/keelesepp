/* global process */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RaamatukoguPage from './RaamatukoguPage.jsx';
import { filterResources, groupByType, groupLinks } from './raamatukoguModel.js';
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

  it('gives every exam card https links grouped by skill', () => {
    RESOURCES.filter((r) => r.type === 'exam').forEach((r) => {
      expect(r.links.length).toBeGreaterThan(0);
      r.links.forEach((item) => expect(item.url.startsWith('https://')).toBe(true));
      expect(new Set(r.links.map((item) => item.url)).size).toBe(r.links.length);
    });
    expect(groupLinks(RESOURCES.find((r) => r.id === 'harno-tasemeeksam-a2').links).map((g) => g.group)).toEqual(['Ettevalmistus', 'Kirjutamine', 'Kuulamine', 'Lugemine', 'Rääkimine']);
  });

  it('orders sections like RESOURCE_TYPES and drops empty ones', () => {
    const sections = groupByType(RESOURCES);
    expect(sections.map((section) => section.type)).toEqual(Object.keys(RESOURCE_TYPES).filter((type) => RESOURCES.some((r) => r.type === type)));
    expect(sections.reduce((sum, section) => sum + section.items.length, 0)).toBe(RESOURCES.length);
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
    expect(filterResources(RESOURCES, { type: 'exam', level: 'B2' }).map((r) => r.id)).toEqual(['harno-tasemeeksamid-info', 'harno-tasemeeksam-b2']);
    expect(filterResources(RESOURCES, { q: 'teemakaardid' }).map((r) => r.id)).toEqual(['harno-tasemeeksam-c1']);
    expect(filterResources(RESOURCES, { q: 'lapsed lasteaed' }).map((r) => r.id)).toEqual(['alusest']);
  });
});

describe('RaamatukoguPage', () => {
  it('shows all cards in sections and narrows them with search', () => {
    renderPage();
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(RESOURCES.length);
    expect(within(screen.getByRole('navigation', { name: 'Rubriigid' })).getByRole('link', { name: /Eksamid ja tasemetestid/ })).toHaveAttribute('href', '#rk-exam');
    fireEvent.change(screen.getByLabelText('Otsi raamatukogust'), { target: { value: 'Sõnaveeb' } });
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Keeleõppija Sõnaveeb', 'Sõnaveeb']);
    expect(screen.queryByRole('navigation', { name: 'Rubriigid' })).not.toBeInTheDocument();
  });

  it('lists an exam card\'s materials by skill', () => {
    renderPage('/library/raamatukogu?tyyp=exam&tase=C1');
    const card = screen.getByRole('heading', { name: 'C1-taseme eksam: näidised ja ülesanded' }).closest('li');
    expect(within(card).getByText('Materjalid (14)')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'I osa teemakaardid' })).toHaveAttribute('href', expect.stringMatching(/^https:\/\/harno\.ee\//));
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
