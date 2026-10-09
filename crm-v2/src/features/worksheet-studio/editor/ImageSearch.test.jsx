/* global Blob */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ImageSearch from './ImageSearch.jsx';
import { openverseCredit } from './openverse.js';

const item = { id: 'abc', title: 'Kass', creator: 'Mari', license: 'by', license_version: '2.0', thumbnail: 'https://api.openverse.org/v1/images/abc/thumb/', attribution: '"Kass" by Mari is licensed under CC BY 2.0.', foreign_landing_url: 'https://example.org/kass' };

describe('ImageSearch', () => {
  it('searches Openverse, downloads the chosen photo and passes its credit', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [item] }) })
      .mockResolvedValueOnce({ ok: true, blob: async () => new Blob(['x'], { type: 'image/jpeg' }) });
    const onPick = vi.fn().mockResolvedValue(undefined);
    render(<ImageSearch onPick={onPick} fetcher={fetcher} translate={async (q) => q} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Pildiotsing' }), { target: { value: 'kass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Otsi' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Vali pilt: Kass' }));
    await waitFor(() => expect(onPick).toHaveBeenCalledTimes(1));
    expect(fetcher.mock.calls[0][0]).toContain('q=kass');
    expect(fetcher.mock.calls[1][0]).toBe('https://api.openverse.org/v1/images/abc/thumb/?full_size=true');
    const [file, credit] = onPick.mock.calls[0];
    expect(file.name).toBe('openverse-abc.jpg');
    expect(credit).toEqual(openverseCredit(item));
    expect(credit.caption).toBe('Foto: Mari · CC BY 2.0');
  });

  it('says so when nothing is found or the service fails', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }).mockResolvedValueOnce({ ok: false, status: 503 });
    render(<ImageSearch onPick={vi.fn()} fetcher={fetcher} translate={async (q) => q} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Pildiotsing' }), { target: { value: 'xyz' } });
    fireEvent.click(screen.getByRole('button', { name: 'Otsi' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Pilte ei leitud');
    fireEvent.click(screen.getByRole('button', { name: 'Otsi' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('503'));
  });

  it('translates the words, filters drawings and loads more', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [item], page_count: 2 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [{ ...item, id: 'def', title: 'Teine' }], page_count: 2 }) });
    render(<ImageSearch onPick={vi.fn()} fetcher={fetcher} translate={async () => 'cat'} />);
    fireEvent.click(screen.getByRole('button', { name: 'Joonistused' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Pildiotsing' }), { target: { value: 'кошка' } });
    fireEvent.click(screen.getByRole('button', { name: 'Otsi' }));
    expect(await screen.findByText('Otsin: „cat”')).toBeInTheDocument();
    expect(fetcher.mock.calls[0][0]).toContain('q=cat');
    expect(fetcher.mock.calls[0][0]).toContain('category=illustration');
    fireEvent.click(screen.getByRole('button', { name: 'Näita veel' }));
    expect(await screen.findByRole('button', { name: 'Vali pilt: Teine' })).toBeInTheDocument();
    expect(fetcher.mock.calls[1][0]).toContain('page=2');
  });
});

describe('englishQuery', () => {
  it('asks MyMemory with the right language and keeps the words on failure', async () => {
    const { englishQuery } = await import('./openverse.js');
    const ok = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ responseData: { translatedText: 'Cat' } }) });
    expect(await englishQuery('кошка', ok)).toBe('cat');
    expect(ok.mock.calls[0][0]).toContain('langpair=ru|en');
    expect(await englishQuery('kass', ok)).toBe('cat');
    expect(ok.mock.calls[1][0]).toContain('langpair=et|en');
    expect(await englishQuery('kass', vi.fn().mockRejectedValue(new Error('offline')))).toBe('kass');
  });
});
