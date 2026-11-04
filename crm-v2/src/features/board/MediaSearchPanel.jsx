/* global fetch, IntersectionObserver */
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { englishQuery } from '../worksheet-studio/editor/openverse.js';
import { mediaBankService } from '../../services/firebase/mediaBank.js';
import { MEDIA_MIME, SOURCES, artItems, bankItems, dragPayload, interleave, searchCommons, searchOpenverse } from './mediaSearch.js';

const OWN_PAGE = 40;
const WEB = new Set(['web', 'openverse', 'commons']);
const SOURCE_LABEL = { openverse: 'Openverse', commons: 'Wikimedia', bank: 'Pank', art: 'Õpik' };

// the school bank is read once per 5 minutes (a few thousand small documents)
let bankCache = { at: 0, assets: null };
async function loadBank(service) {
  if (bankCache.assets && Date.now() - bankCache.at < 5 * 60 * 1000) return bankCache.assets;
  const assets = await service.list();
  bankCache = { at: Date.now(), assets };
  return assets;
}
// the textbook art list is a big module: only loaded when „Õpiku pildid” is opened
const loadArt = () => import('../worksheet-generator/art/textbookArt.js').then((module) => ({ visuals: module.ALL_VISUALS, srcOf: module.visualSrc }));

/**
 * „Pildid”: search pictures during the lesson and drag one onto the board (or tap it: it goes to the middle of the
 * visible board). Teacher only. `onPlace(item)` puts it on the board; `placing` is the id being added.
 */
export default function MediaSearchPanel({ onPlace, onClose, placing = '', fetcher = fetch, translate = englishQuery, bank = mediaBankService, art = loadArt }) {
  const [source, setSource] = useState('web');
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ key: '', words: '', items: [], next: null, own: [] });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const scroller = useRef(null);
  const sentinel = useRef(null);
  const request = useRef(0);

  // one page of the chosen source; `cursor` is { openverse: page, commons: offset } for the web, a count for our own
  const fetchPage = useCallback(async (which, words, cursor) => {
    if (which === 'openverse') { const r = await searchOpenverse(words, cursor?.openverse || 1, fetcher); return { items: r.items, next: r.next ? { openverse: r.next } : null }; }
    if (which === 'commons') { const r = await searchCommons(words, cursor?.commons || 0, fetcher); return { items: r.items, next: r.next != null ? { commons: r.next } : null }; }
    // „Internet”: both at once; one failing still shows the other
    const [open, commons] = await Promise.allSettled([
      cursor && !('openverse' in cursor) ? Promise.resolve({ items: [], next: null }) : searchOpenverse(words, cursor?.openverse || 1, fetcher),
      cursor && !('commons' in cursor) ? Promise.resolve({ items: [], next: null }) : searchCommons(words, cursor?.commons || 0, fetcher),
    ]);
    if (open.status === 'rejected' && commons.status === 'rejected') throw open.reason;
    const a = open.status === 'fulfilled' ? open.value : { items: [], next: null };
    const b = commons.status === 'fulfilled' ? commons.value : { items: [], next: null };
    const next = { ...(a.next ? { openverse: a.next } : {}), ...(b.next != null ? { commons: b.next } : {}) };
    return { items: interleave(a.items, b.items), next: Object.keys(next).length ? next : null };
  }, [fetcher]);

  const run = useCallback(async (which, text) => {
    const id = ++request.current;
    setError(''); setBusy('search');
    try {
      if (WEB.has(which)) {
        if (!text.trim()) { setState({ key: which, words: '', items: [], next: null, own: [] }); return; }
        const words = await translate(text.trim());
        const page = await fetchPage(which, words, null);
        if (id !== request.current) return;
        setState({ key: which, words, items: page.items, next: page.next, own: [] });
        if (!page.items.length) setError('Pilte ei leitud. Proovi teist sõna.');
      } else {
        const own = which === 'bank'
          ? bankItems(await loadBank(bank), text)
          : await art().then(({ visuals, srcOf }) => artItems(visuals, text, srcOf));
        if (id !== request.current) return;
        setState({ key: which, words: text.trim(), items: own.slice(0, OWN_PAGE), next: own.length > OWN_PAGE ? OWN_PAGE : null, own });
        if (!own.length) setError(text.trim() ? 'Selle sõnaga pilte ei leitud.' : 'Siin pole veel pilte.');
      }
      scroller.current?.scrollTo?.({ top: 0 });
    } catch (searchError) {
      if (id === request.current) setError(which === 'bank' ? 'Kooli pildipanka ei saanud avada.' : searchError?.message || 'Otsing ebaõnnestus.');
    } finally {
      if (id === request.current) setBusy('');
    }
  }, [art, bank, fetchPage, translate]);

  const more = useCallback(async () => {
    if (busy || state.next == null || state.key !== source) return;
    if (!WEB.has(source)) { setState((current) => ({ ...current, items: current.own.slice(0, current.next + OWN_PAGE), next: current.own.length > current.next + OWN_PAGE ? current.next + OWN_PAGE : null })); return; }
    const id = request.current;
    setBusy('more');
    try {
      const page = await fetchPage(source, state.words, state.next);
      if (id !== request.current) return;
      setState((current) => {
        const seen = new Set(current.items.map((item) => item.id));
        return { ...current, items: [...current.items, ...page.items.filter((item) => !seen.has(item.id))], next: page.next };
      });
    } catch (moreError) {
      setError(moreError?.message || 'Rohkem pilte ei saanud laadida.');
    } finally {
      setBusy('');
    }
  }, [busy, fetchPage, source, state.key, state.next, state.words]);

  // our own sources show everything at once; a web tab searches again with the same words
  const choose = (which) => { setSource(which); run(which, query); };
  useEffect(() => {
    const node = sentinel.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) more(); }, { root: scroller.current, rootMargin: '300px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [more]);

  const items = state.key === source ? state.items : [];
  return (
    <aside className="sb-media" aria-label="Pildid">
      <header className="sb-media__head">
        <strong>Pildid</strong>
        <button type="button" className="sb-media__close" aria-label="Sulge pildid" onClick={onClose}><X size={18} /></button>
      </header>
      <form className="sb-media__search" onSubmit={(event) => { event.preventDefault(); run(source, query); }}>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="nt kass, кошка, market…" aria-label="Otsi pilte" />
        <button type="submit" aria-label="Otsi" disabled={busy === 'search'}><Search size={16} /></button>
      </form>
      <div className="sb-media__tabs" role="tablist" aria-label="Allikas">
        {SOURCES.map(([key, label]) => <button type="button" role="tab" key={key} aria-selected={source === key} className={source === key ? 'is-active' : ''} onClick={() => choose(key)}>{label}</button>)}
      </div>
      {WEB.has(source) && state.key === source && state.words && state.words !== query.trim() ? <p className="sb-media__hint">Otsin: „{state.words}”</p> : null}
      {error ? <p className="sb-media__hint" role="alert">{error}</p> : null}
      <div ref={scroller} className="sb-media__results">
        {busy === 'search' ? <p className="sb-media__hint">Otsin…</p> : null}
        {!items.length && !busy && !error && WEB.has(source) ? <p className="sb-media__hint">Kirjuta sõna (eesti, vene või inglise keeles) ja vajuta Enter. Lohista pilt tahvlile või puuduta seda.</p> : null}
        <div className="sb-media__grid">
          {items.map((item) => (
            <button type="button" key={item.id} className="sb-media__item" draggable disabled={placing === item.id}
              title={[item.title, item.credit].filter(Boolean).join('\n')} aria-label={`Lisa tahvlile: ${item.title || 'pilt'}`}
              onDragStart={(event) => { event.dataTransfer.setData(MEDIA_MIME, dragPayload(item)); event.dataTransfer.setData('text/uri-list', item.full); event.dataTransfer.effectAllowed = 'copy'; }}
              onClick={() => onPlace(item)}>
              <img src={item.thumb} alt="" loading="lazy" draggable={false} style={item.width && item.height ? { aspectRatio: `${item.width} / ${item.height}` } : undefined}
                onError={(event) => { event.currentTarget.closest('button').hidden = true; }} />
              <span className="sb-media__badge">{placing === item.id ? 'Lisan…' : SOURCE_LABEL[item.source]}</span>
            </button>
          ))}
        </div>
        {state.key === source && state.next != null ? <button type="button" ref={sentinel} className="sb-media__more" disabled={Boolean(busy)} onClick={more}>{busy === 'more' ? 'Laen…' : 'Rohkem'}</button> : null}
      </div>
      <p className="sb-media__foot">Vabad litsentsid: autor ja litsents jäävad pildi juurde (ⓘ).</p>
    </aside>
  );
}
