/* global fetch, File */
import { useState } from 'react';
import { openverseCredit } from './openverse.js';

// Free, openly licensed photos from Openverse (no key, no student data sent: only the search words).
const API = 'https://api.openverse.org/v1/images/';

export default function ImageSearch({ onPick, fetcher = fetch }) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const search = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setBusy('search'); setError('');
    try {
      const response = await fetcher(`${API}?q=${encodeURIComponent(query.trim())}&page_size=12&mature=false`);
      if (!response.ok) throw new Error(`Openverse vastas veaga ${response.status}.`);
      const data = await response.json();
      setItems(data.results || []);
      if (!(data.results || []).length) setError('Pilte ei leitud. Proovi teist sõna (ka inglise keeles).');
    } catch (searchError) {
      setError(searchError.message || 'Pildiotsing ebaõnnestus.');
    } finally {
      setBusy('');
    }
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
      <span className="ed-hint">Autor ja litsents lisatakse pildiallkirja.</span>
    </div>
  );
}
