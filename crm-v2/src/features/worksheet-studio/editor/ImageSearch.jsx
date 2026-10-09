/* global fetch, File */
import { useState } from 'react';
import { IMAGE_KINDS, englishQuery, openverseCredit } from './openverse.js';

// Free, openly licensed photos from Openverse (no key, no student data sent: only the search words).
const API = 'https://api.openverse.org/v1/images/';

export default function ImageSearch({ onPick, fetcher = fetch, translate = englishQuery }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [kind, setKind] = useState('');
  const [asked, setAsked] = useState({ words: '', page: 1, more: false });

  // Estonian / Russian words are translated to English for Openverse; „Näita veel” loads the next page
  const run = async (words, page, append) => {
    setBusy(append ? 'more' : 'search'); setError('');
    try {
      const response = await fetcher(`${API}?q=${encodeURIComponent(words)}&page_size=20&page=${page}&mature=false${kind ? `&category=${kind}` : ''}`);
      if (!response.ok) throw new Error(`Openverse vastas veaga ${response.status}.`);
      const data = await response.json();
      const results = data.results || [];
      setItems((current) => (append ? [...current, ...results] : results));
      setAsked({ words, page, more: page < (Number(data.page_count) || 1) });
      if (!append && !results.length) setError('Pilte ei leitud. Proovi teist sõna või „Kõik”.');
    } catch (searchError) {
      setError(searchError.message || 'Pildiotsing ebaõnnestus.');
    } finally {
      setBusy('');
    }
  };
  const search = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setBusy('search');
    const words = await translate(query.trim());
    await run(words, 1, false);
  };

  const pick = async (item) => {
    setBusy(item.id); setError('');
    try {
      const response = await fetcher(`${item.thumbnail}?full_size=true`);
      if (!response.ok) throw new Error('Pilti ei saanud alla laadida.');
      const blob = await response.blob();
      const file = new File([blob], `openverse-${item.id}.jpg`, { type: blob.type || 'image/jpeg' });
      await onPick(file, openverseCredit(item));
    } catch (pickError) {
      setError(pickError.message || 'Pilti ei saanud lisada.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="ed-section st-imgsearch">
      <span className="ed-label">Otsi pilti internetist (vabad litsentsid)</span>
      <form className="ed-row" onSubmit={search}>
        <input className="ed-input" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="nt kass, cat, hommik…" aria-label="Pildiotsing" />
        <button type="submit" className="ed-btn" disabled={Boolean(busy)}>{busy === 'search' ? 'Otsin…' : 'Otsi'}</button>
      </form>
      <div className="st-imgsearch-kinds" role="group" aria-label="Pildi liik">{IMAGE_KINDS.map(([key, label]) => <button type="button" key={key || 'all'} aria-pressed={kind === key} className={kind === key ? 'is-active' : ''} onClick={() => setKind(key)}>{label}</button>)}</div>
      {asked.words && asked.words !== query.trim() ? <span className="ed-hint">Otsin: „{asked.words}”</span> : null}
      {error ? <span className="ed-hint" role="alert">{error}</span> : null}
      {items.length ? (
        <div className="st-imgsearch-grid">
          {items.map((item) => (
            <button type="button" key={item.id} onClick={() => pick(item)} disabled={Boolean(busy)} title={item.title || ''} aria-label={`Vali pilt: ${item.title || item.id}`}>
              <img src={item.thumbnail} alt="" loading="lazy" />
              {busy === item.id ? <span>Lisan…</span> : null}
            </button>
          ))}
        </div>
      ) : null}
      {asked.more && items.length ? <button type="button" className="ed-btn" disabled={Boolean(busy)} onClick={() => run(asked.words, asked.page + 1, true)}>{busy === 'more' ? 'Laen…' : 'Näita veel'}</button> : null}
      <span className="ed-hint">Autor ja litsents lisatakse pildiallkirja. Pilt läheb ka kooli pildipanka.</span>
    </div>
  );
}
