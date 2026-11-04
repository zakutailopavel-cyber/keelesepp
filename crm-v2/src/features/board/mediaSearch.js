/* global URLSearchParams */
// „Pildid” on the live board (owner 2026-11-04: „во время урока найти нужное медиа через какой-то поиск и просто
// перетащить его на доску — как встроенный Pinterest”). Pinterest has no open search API, so the panel searches open
// sources: Openverse and Wikimedia Commons (no key, only the search words are sent), the school's own picture bank
// (`mediaAssets`) and the course textbook art. Every result is one shape (`MediaItem`), so the grid, the drag and the
// board element do not care where it came from.

export const OPENVERSE_API = 'https://api.openverse.org/v1/images/';
export const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
export const PAGE_SIZE = 20;
// the drag payload type between the panel and the board stage
export const MEDIA_MIME = 'application/x-keelesepp-media';

export const SOURCES = [
  ['web', 'Internet'],
  ['openverse', 'Openverse'],
  ['commons', 'Wikimedia'],
  ['bank', 'Kooli pank'],
  ['art', 'Õpiku pildid'],
];

const str = (value, max) => String(value ?? '').trim().slice(0, max);
const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();
const https = (value) => (/^https:\/\//.test(String(value || '')) ? String(value) : '');

/**
 * @typedef {{ id: string, source: string, thumb: string, full: string, width: number, height: number, title: string,
 *   author: string, license: string, sourceUrl: string, credit: string, own?: boolean, storagePath?: string }} MediaItem
 */

// the short credit kept on the board element and shown under „ⓘ”: who made it, which licence, where it is from
export function creditLine({ author = '', license = '', origin = '' }) {
  return [author ? `Autor: ${author}` : '', license, origin].filter(Boolean).join(' · ').slice(0, 300);
}

// ── Openverse ────────────────────────────────────────────────────
export function openverseItem(item) {
  if (!item?.id || !item.thumbnail) return null;
  const license = `CC ${String(item.license || '').toUpperCase()} ${item.license_version || ''}`.trim();
  const author = str(item.creator, 120);
  return {
    id: `openverse:${item.id}`, source: 'openverse',
    thumb: item.thumbnail, full: `${item.thumbnail}?full_size=true`,
    width: Number(item.width) || 0, height: Number(item.height) || 0,
    title: str(item.title, 200), author, license,
    sourceUrl: https(item.foreign_landing_url) || https(item.url),
    credit: creditLine({ author, license, origin: `Openverse${item.provider ? ` / ${item.provider}` : ''}` }),
  };
}

export async function searchOpenverse(words, page = 1, fetcher = globalThis.fetch) {
  const response = await fetcher(`${OPENVERSE_API}?q=${encodeURIComponent(words)}&page_size=${PAGE_SIZE}&page=${page}&mature=false`);
  if (!response?.ok) throw new Error(`Openverse vastas veaga ${response?.status || ''}.`.replace(' .', '.'));
  const data = await response.json();
  const items = (data.results || []).map(openverseItem).filter(Boolean);
  return { items, next: page < (Number(data.page_count) || 1) && items.length ? page + 1 : null };
}

// ── Wikimedia Commons ────────────────────────────────────────────
// files in namespace 6 found by full text; `imageinfo` gives a 500 px thumbnail, a bigger one and the licence metadata
export function commonsUrl(words, offset = 0) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', origin: '*', generator: 'search', gsrsearch: words, gsrnamespace: '6', gsrlimit: String(PAGE_SIZE),
    gsroffset: String(offset || 0), prop: 'imageinfo', iiprop: 'url|size|mime|extmetadata', iiurlwidth: '400',
    iiextmetadatafilter: 'Artist|LicenseShortName|LicenseUrl|ObjectName|AttributionRequired|Credit',
  });
  return `${COMMONS_API}?${params}`;
}

// a bigger copy for the board: the 960 px thumbnail when the file is larger, else the file itself
function commonsFull(info) {
  const bigger = info.responsiveUrls?.['2'] || '';
  if (bigger) return bigger;
  if (info.thumburl && Number(info.width) > 1280) return String(info.thumburl).replace(/\/\d+px-/, '/1280px-');
  return info.url || info.thumburl || '';
}

export function commonsItems(data) {
  const pages = Object.values(data?.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
  return pages.map((page) => {
    const info = page.imageinfo?.[0];
    if (!info || !/^image\/(jpeg|png|gif|webp|svg\+xml|tiff)$/.test(info.mime || '') || !info.thumburl) return null;
    const meta = info.extmetadata || {};
    const author = str(stripHtml(meta.Artist?.value) || stripHtml(meta.Credit?.value), 120);
    const license = str(stripHtml(meta.LicenseShortName?.value), 60);
    const title = str(stripHtml(meta.ObjectName?.value) || String(page.title || '').replace(/^File:/, '').replace(/\.[a-z0-9]+$/i, ''), 200);
    return {
      id: `commons:${page.pageid}`, source: 'commons',
      thumb: info.thumburl, full: commonsFull(info),
      width: Number(info.width) || Number(info.thumbwidth) || 0, height: Number(info.height) || Number(info.thumbheight) || 0,
      title, author, license,
      sourceUrl: https(info.descriptionurl) || `https://commons.wikimedia.org/wiki/${encodeURIComponent(String(page.title || ''))}`,
      credit: creditLine({ author, license, origin: 'Wikimedia Commons' }),
    };
  }).filter(Boolean);
}

export async function searchCommons(words, offset = 0, fetcher = globalThis.fetch) {
  const response = await fetcher(commonsUrl(words, offset));
  if (!response?.ok) throw new Error(`Wikimedia vastas veaga ${response?.status || ''}.`.replace(' .', '.'));
  const data = await response.json();
  const next = data?.continue?.gsroffset;
  return { items: commonsItems(data), next: Number.isFinite(Number(next)) ? Number(next) : null };
}

// ── our own: the school bank and the textbook art ────────────────
// the words of a query that must all be found in the item's text (Estonian, no translation)
const wordsOf = (query) => String(query || '').toLocaleLowerCase('et').split(/[\s,]+/).filter((word) => word.length > 1);
const matches = (text, words) => { const hay = String(text || '').toLocaleLowerCase('et'); return words.every((word) => hay.includes(word)); };
// an address of our own site (textbook art is a path) is made absolute: the board element needs https://…
export function absoluteUrl(src, origin = globalThis.location?.origin || '') {
  const value = String(src || '');
  if (/^https?:\/\//.test(value)) return value;
  return value.startsWith('/') && origin ? `${origin}${value}` : value;
}

export function bankItems(assets, query, origin) {
  const words = wordsOf(query);
  return (assets || [])
    .filter((asset) => asset.kind === 'image' && asset.src)
    .filter((asset) => !words.length || matches([asset.caption, asset.topic, asset.sheetTitle, ...(asset.tags || [])].join(' '), words))
    .map((asset) => {
      const url = absoluteUrl(asset.src, origin);
      return {
        id: `bank:${asset.id}`, source: 'bank', own: true, thumb: url, full: url, storagePath: asset.storagePath || '',
        width: Number(asset.width) || 0, height: Number(asset.height) || 0,
        title: str(asset.caption || asset.topic || asset.sheetTitle, 200), author: '', license: '', sourceUrl: '',
        // a bank picture found on the internet keeps the credit it was saved with
        credit: str(asset.credit || (/^Foto: /.test(asset.caption || '') ? asset.caption : ''), 300),
      };
    });
}

export function artItems(visuals, query, srcOf, origin) {
  const words = wordsOf(query);
  return (visuals || [])
    .filter((visual) => !words.length || matches([visual.id, visual.alt, visual.caption, visual.scene, ...(visual.text || []), ...(visual.cast || [])].join(' '), words))
    .map((visual) => {
      const url = absoluteUrl(srcOf(visual), origin);
      return {
        id: `art:${visual.id}`, source: 'art', own: true, thumb: url, full: url,
        width: visual.format === 'object' ? 1600 : visual.format === 'opener' ? 1200 : 1600,
        height: visual.format === 'object' ? 1600 : visual.format === 'opener' ? 1600 : 1067,
        title: str(visual.caption || visual.alt || visual.id, 200), author: '', license: '', sourceUrl: '', credit: '',
      };
    });
}

// „Internet”: the two open sources one after the other, so neither drowns the other
export function interleave(a = [], b = []) {
  const out = [];
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if (a[index]) out.push(a[index]);
    if (b[index]) out.push(b[index]);
  }
  return out;
}

// ── to the board ─────────────────────────────────────────────────
// the drag payload: only what the board needs (no functions, no huge strings)
export function dragPayload(item) {
  return JSON.stringify({ id: item.id, source: item.source, full: item.full, thumb: item.thumb, width: item.width, height: item.height, title: item.title, credit: item.credit, sourceUrl: item.sourceUrl, own: Boolean(item.own), storagePath: item.storagePath || '' });
}
export function readPayload(text) {
  try {
    const item = JSON.parse(text || '');
    return item && typeof item.full === 'string' && item.full ? item : null;
  } catch {
    return null;
  }
}

// The image element for a dropped (or tapped) result: centred on the drop point in board units, about 320 screen px
// wide whatever the zoom (never over 60 % of the visible board), with the credit and the source link kept on it.
export function mediaElement({ url, storagePath = '', width, height, credit = '', sourceUrl = '' }, point, view, box = { w: 900, h: 600 }) {
  const naturalW = Number(width) || 800;
  const naturalH = Number(height) || 600;
  const screenW = Math.min(320, box.w * 0.6, (box.h * 0.6 * naturalW) / naturalH);
  const w = Math.max(20, Math.round(screenW / (view.scale || 1)));
  const h = Math.max(20, Math.round((w * naturalH) / naturalW));
  return {
    type: 'image', x: Math.round(point.x - w / 2), y: Math.round(point.y - h / 2), w, h, url, locked: false,
    ...(storagePath ? { storagePath } : {}),
    ...(credit ? { credit: str(credit, 300) } : {}),
    ...(https(sourceUrl) ? { sourceUrl: https(sourceUrl).slice(0, 2000) } : {}),
  };
}

// an external picture is copied into our Storage (the student's browser then loads it from Firebase like any board
// picture, and it stays if the original goes away); if that fails, the original https address is kept
export async function placeableImage(item, { upload, fetcher = globalThis.fetch, FileCtor = globalThis.File } = {}) {
  if (item.own || !upload) return { url: item.full, storagePath: item.storagePath || '' };
  try {
    const response = await fetcher(item.full);
    if (!response?.ok) throw new Error('download');
    const blob = await response.blob();
    if (!/^image\//.test(blob.type || '')) throw new Error('type');
    const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg').replace('svg+xml', 'svg');
    const name = `${item.source}-${String(item.id).split(':').pop()}`.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 80);
    const uploaded = await upload(new FileCtor([blob], `${name}.${ext}`, { type: blob.type }));
    if (uploaded?.url) return { url: uploaded.url, storagePath: uploaded.storagePath || '' };
  } catch {
    // fall through to the original address
  }
  return { url: item.full, storagePath: '' };
}
