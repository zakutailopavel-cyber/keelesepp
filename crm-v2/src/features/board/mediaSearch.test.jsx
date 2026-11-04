import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import MediaSearchPanel from './MediaSearchPanel.jsx';
import StudentBoard from './StudentBoard.jsx';
import { MEDIA_MIME, absoluteUrl, artItems, bankItems, commonsItems, commonsUrl, creditLine, dragPayload, interleave, mediaElement, openverseItem, placeableImage, readPayload, searchCommons } from './mediaSearch.js';

globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

// the shape of a real Commons answer (generator=search + imageinfo, checked with curl 2026-11-04)
const commonsAnswer = {
  continue: { gsroffset: 20, continue: 'gsroffset||' },
  query: {
    pages: {
      9437797: {
        pageid: 9437797, ns: 6, title: 'File:Felis catus-cat on snow.jpg', index: 2,
        imageinfo: [{
          width: 2848, height: 2136, mime: 'image/jpeg',
          thumburl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Felis.jpg/500px-Felis.jpg',
          responsiveUrls: { 2: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Felis.jpg/960px-Felis.jpg' },
          url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Felis.jpg',
          descriptionurl: 'https://commons.wikimedia.org/wiki/File:Felis_catus-cat_on_snow.jpg',
          extmetadata: {
            Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Von.grzanka">Von.grzanka</a>' },
            LicenseShortName: { value: 'CC BY-SA 3.0' },
          },
        }],
      },
      68960758: {
        pageid: 68960758, ns: 6, title: 'File:Cat playing with a lizard.jpg', index: 1,
        imageinfo: [{
          width: 900, height: 600, mime: 'image/jpeg', thumburl: 'https://thumb.wikimedia.org/x/500px-Cat.jpg', url: 'https://upload.wikimedia.org/x/Cat.jpg',
          descriptionurl: 'https://commons.wikimedia.org/wiki/File:Cat_playing_with_a_lizard.jpg',
          extmetadata: { ObjectName: { value: 'Cat playing with a lizard' }, Artist: { value: 'Basile Morin' }, LicenseShortName: { value: 'CC BY-SA 4.0' } },
        }],
      },
      5: { pageid: 5, title: 'File:Cat sound.ogg', index: 3, imageinfo: [{ mime: 'application/ogg', url: 'https://upload.wikimedia.org/x.ogg' }] },
    },
  },
};

const openverseResult = {
  id: 'abc', title: 'Cat Fish 2', thumbnail: 'https://api.openverse.org/v1/images/abc/thumb/', url: 'https://live.staticflickr.com/x.jpg',
  foreign_landing_url: 'https://www.flickr.com/photos/1/2', creator: 'admiller', license: 'by', license_version: '2.0', provider: 'flickr', width: 1024, height: 768,
};

describe('media search sources', () => {
  it('reads Wikimedia Commons results in search order, with author, licence and the file page; skips non-images', () => {
    const items = commonsItems(commonsAnswer);
    expect(items.map((item) => item.id)).toEqual(['commons:68960758', 'commons:9437797']);
    expect(items[0]).toMatchObject({ source: 'commons', title: 'Cat playing with a lizard', author: 'Basile Morin', license: 'CC BY-SA 4.0', full: 'https://upload.wikimedia.org/x/Cat.jpg', width: 900, height: 600 });
    // HTML in the author is stripped; a big file is placed as its 960 px copy; the title comes from the file name
    expect(items[1]).toMatchObject({ author: 'Von.grzanka', title: 'Felis catus-cat on snow', full: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Felis.jpg/960px-Felis.jpg', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Felis_catus-cat_on_snow.jpg' });
    expect(items[1].credit).toBe('Autor: Von.grzanka · CC BY-SA 3.0 · Wikimedia Commons');
  });

  it('asks Commons for files with CORS and pages by offset', async () => {
    const url = new URL(commonsUrl('cat', 40));
    expect(url.origin).toBe('https://commons.wikimedia.org');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({ origin: '*', gsrsearch: 'cat', gsrnamespace: '6', gsroffset: '40', prop: 'imageinfo' });
    const fetcher = vi.fn(async () => ({ ok: true, json: async () => commonsAnswer }));
    await expect(searchCommons('cat', 0, fetcher)).resolves.toMatchObject({ next: 20 });
    await expect(searchCommons('cat', 0, async () => ({ ok: true, json: async () => ({}) }))).resolves.toEqual({ items: [], next: null });
  });

  it('maps an Openverse result with its credit and mixes the two web sources', () => {
    const item = openverseItem(openverseResult);
    expect(item).toMatchObject({ id: 'openverse:abc', full: 'https://api.openverse.org/v1/images/abc/thumb/?full_size=true', sourceUrl: 'https://www.flickr.com/photos/1/2', license: 'CC BY 2.0' });
    expect(item.credit).toBe('Autor: admiller · CC BY 2.0 · Openverse / flickr');
    expect(interleave([1, 2, 3], ['a'])).toEqual([1, 'a', 2, 3]);
    expect(creditLine({})).toBe('');
  });

  it('searches the school bank and the textbook art by Estonian words; paths become absolute', () => {
    const assets = [
      { id: 'k1', kind: 'image', src: 'https://firebasestorage.googleapis.com/a.jpg', caption: 'Kass aknal', tags: ['kass'], width: 800, height: 600 },
      { id: 'k2', kind: 'text', text: 'kass' },
      { id: 'k3', kind: 'image', src: '/textbook-art/a2/a2-001/x.webp', caption: 'Foto: Mari · CC BY 4.0', topic: 'Turg' },
    ];
    expect(bankItems(assets, 'kass').map((item) => item.id)).toEqual(['bank:k1']);
    const turg = bankItems(assets, 'TURG', 'https://crm.example');
    expect(turg[0]).toMatchObject({ full: 'https://crm.example/textbook-art/a2/a2-001/x.webp', own: true, credit: 'Foto: Mari · CC BY 4.0' });
    const visuals = [{ id: 'a2-001-avasta-1', format: 'scene', alt: 'Anna tutvustab end', caption: 'Pilt 1.', cast: ['Anna'] }, { id: 'b', format: 'object', alt: 'Õun' }];
    const art = artItems(visuals, 'anna', (visual) => `/textbook-art/a2/${visual.id}.webp`, 'https://crm.example');
    expect(art).toHaveLength(1);
    expect(art[0]).toMatchObject({ source: 'art', full: 'https://crm.example/textbook-art/a2/a2-001-avasta-1.webp', width: 1600, height: 1067 });
    expect(absoluteUrl('https://x/y.png')).toBe('https://x/y.png');
  });
});

describe('a result on the board', () => {
  it('becomes an image centred on the drop point, ~320 screen px wide at any zoom, with the credit kept', () => {
    const element = mediaElement({ url: 'https://firebasestorage.googleapis.com/x.jpg', storagePath: 'curriculum/x.jpg', width: 800, height: 400, credit: 'Autor: A · CC BY 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:X.jpg' }, { x: 500, y: 300 }, { x: 0, y: 0, scale: 2 }, { w: 1200, h: 800 });
    expect(element).toEqual({ type: 'image', x: 420, y: 260, w: 160, h: 80, url: 'https://firebasestorage.googleapis.com/x.jpg', storagePath: 'curriculum/x.jpg', locked: false, credit: 'Autor: A · CC BY 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:X.jpg' });
    // no credit, no http source link (the rules allow https only)
    const own = mediaElement({ url: 'https://crm.example/a.webp', width: 100, height: 100, sourceUrl: 'http://x' }, { x: 0, y: 0 }, { x: 0, y: 0, scale: 1 });
    expect(own).not.toHaveProperty('credit');
    expect(own).not.toHaveProperty('sourceUrl');
  });

  it('carries only the needed fields through the drag and rejects foreign drops', () => {
    const payload = readPayload(dragPayload({ ...openverseItem(openverseResult), extra: 'x' }));
    expect(payload).toMatchObject({ id: 'openverse:abc', credit: expect.stringContaining('CC BY 2.0') });
    expect(payload).not.toHaveProperty('extra');
    expect(readPayload('not json')).toBeNull();
    expect(readPayload('{"id":"x"}')).toBeNull();
  });

  it('copies an internet picture into our Storage, keeps the original address when that fails, never copies our own', async () => {
    const item = openverseItem(openverseResult);
    const upload = vi.fn(async (file) => ({ url: 'https://firebasestorage.googleapis.com/copy.jpg', storagePath: `curriculum/${file.name}` }));
    const fetcher = vi.fn(async () => ({ ok: true, blob: async () => new globalThis.Blob(['x'], { type: 'image/jpeg' }) }));
    await expect(placeableImage(item, { upload, fetcher })).resolves.toEqual({ url: 'https://firebasestorage.googleapis.com/copy.jpg', storagePath: 'curriculum/openverse-abc.jpg' });
    await expect(placeableImage(item, { upload, fetcher: async () => { throw new TypeError('CORS'); } })).resolves.toEqual({ url: item.full, storagePath: '' });
    await expect(placeableImage(item, { upload, fetcher: async () => ({ ok: true, blob: async () => new globalThis.Blob(['<html>'], { type: 'text/html' }) }) })).resolves.toEqual({ url: item.full, storagePath: '' });
    upload.mockClear();
    await expect(placeableImage({ own: true, full: 'https://crm.example/a.webp' }, { upload, fetcher })).resolves.toEqual({ url: 'https://crm.example/a.webp', storagePath: '' });
    expect(upload).not.toHaveBeenCalled();
  });
});

function boardService() {
  const data = [];
  let listener = null;
  return {
    data,
    subscribePages: (_s, onChange) => { onChange([]); return () => {}; },
    subscribeElements: (_s, _p, onChange) => { listener = onChange; onChange([...data]); return () => {}; },
    add: vi.fn(async (_s, _p, element) => { const id = `el-${data.length + 1}`; data.push({ id, ...element }); listener?.([...data]); return id; }),
    update: vi.fn(async () => {}), remove: vi.fn(async () => {}), clear: vi.fn(async () => 0), addPage: vi.fn(async () => 'pg'), renamePage: vi.fn(async () => {}),
  };
}

describe('„Pildid” panel on the live board', () => {
  const teacher = { uid: 't1', displayName: 'Kati', roles: ['teacher'] };

  it('teacher drops a result onto the board: an image at the drop point with the ⓘ credit; the student has no panel', async () => {
    const service = boardService();
    const { container, unmount } = render(<StudentBoard studentId="s-1" user={teacher} staff variant="room" service={service} />);
    expect(screen.getByRole('button', { name: 'Pildid' })).toBeInTheDocument();
    const svg = container.querySelector('svg[aria-label="Õpilase tahvel"]');
    svg.getBoundingClientRect = () => ({ left: 100, top: 50, width: 1000, height: 700, right: 1100, bottom: 750, x: 100, y: 50 });
    const item = { id: 'commons:1', source: 'commons', own: true, full: 'https://firebasestorage.googleapis.com/x.jpg', width: 640, height: 480, credit: 'Autor: A · CC BY 4.0 · Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:X.jpg' };
    const transfer = { types: [MEDIA_MIME], getData: (type) => (type === MEDIA_MIME ? dragPayload(item) : ''), dropEffect: '' };
    const stage = container.querySelector('.sb-stage');
    fireEvent.dragOver(stage, { dataTransfer: transfer });
    const drop = createEvent.drop(stage, { dataTransfer: transfer });
    Object.defineProperties(drop, { clientX: { value: 400 }, clientY: { value: 350 } });
    fireEvent(stage, drop);
    await waitFor(() => expect(service.add).toHaveBeenCalled());
    const [, , element] = service.add.mock.calls[0];
    expect(element).toMatchObject({ type: 'image', url: item.full, credit: item.credit, sourceUrl: item.sourceUrl, byStaff: true, w: 320, h: 240 });
    // the view starts at 0,0 scale 1 in jsdom: the drop point (300, 300) is the centre
    expect(element.x + element.w / 2).toBe(300);
    expect(element.y + element.h / 2).toBe(300);
    const link = await screen.findByRole('link', { name: /Pildi allikas/ });
    expect(link).toHaveAttribute('href', item.sourceUrl);
    unmount();

    render(<StudentBoard studentId="s-1" user={{ uid: 's1', roles: ['student'] }} variant="room" service={boardService()} />);
    expect(screen.queryByRole('button', { name: 'Pildid' })).toBeNull();
  });

  it('searches the web sources (translated words), shows a masonry grid and adds a tapped result', async () => {
    const fetcher = vi.fn(async (url) => ({
      ok: true,
      json: async () => (String(url).includes('openverse') ? { page_count: 3, results: [openverseResult] } : commonsAnswer),
    }));
    const translate = vi.fn(async () => 'cat');
    const onPlace = vi.fn();
    render(<MediaSearchPanel onPlace={onPlace} onClose={() => {}} fetcher={fetcher} translate={translate} bank={{ list: async () => [] }} art={async () => ({ visuals: [], srcOf: () => '' })} />);
    fireEvent.change(screen.getByRole('searchbox', { name: 'Otsi pilte' }), { target: { value: 'kass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Otsi' }));
    const tiles = await screen.findAllByRole('button', { name: /Lisa tahvlile/ });
    expect(translate).toHaveBeenCalledWith('kass');
    expect(tiles).toHaveLength(3);
    expect(screen.getByText('Otsin: „cat”')).toBeInTheDocument();
    expect(tiles[0]).toHaveAttribute('draggable', 'true');
    fireEvent.click(tiles[0]);
    expect(onPlace).toHaveBeenCalledWith(expect.objectContaining({ id: 'openverse:abc' }));
    // „Rohkem”: the next Openverse page and the next Commons offset
    fireEvent.click(screen.getByRole('button', { name: 'Rohkem' }));
    await waitFor(() => expect(fetcher.mock.calls.some(([url]) => String(url).includes('page=2'))).toBe(true));
    expect(fetcher.mock.calls.some(([url]) => String(url).includes('gsroffset=20'))).toBe(true);
  });

  it('opens the school bank without a query and says when it cannot', async () => {
    const assets = [{ id: 'k1', kind: 'image', src: 'https://firebasestorage.googleapis.com/a.jpg', caption: 'Kass' }];
    const { unmount } = render(<MediaSearchPanel onPlace={() => {}} onClose={() => {}} fetcher={vi.fn()} translate={async (q) => q} bank={{ list: async () => assets }} art={async () => ({ visuals: [], srcOf: () => '' })} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Kooli pank' }));
    expect(await screen.findByRole('button', { name: 'Lisa tahvlile: Kass' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Õpiku pildid' }));
    expect(await screen.findByText('Siin pole veel pilte.')).toBeInTheDocument();
    unmount();
  });
});
