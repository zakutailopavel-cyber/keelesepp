import { useEffect, useMemo, useState } from 'react';
import { mediaBankService } from '../../services/firebase/mediaBank.js';
import ImageSearch from './editor/ImageSearch.jsx';
import { LEVELS, searchAssets, textbookArtAssets } from './mediaBank.js';


const EXTRAS = [['gaps', '+ lüngad tekstist'], ['wordorder', '+ sõnajärg'], ['vocab', '+ sõnavara']];

/**
 * Constructor „Pank”: the school's pictures (everything used in worksheets, new uploads, the textbook art), texts by
 * level (reading texts and dialogues of published lessons) and the internet search. One click puts it on the sheet.
 */
export default function MediaBankPanel({ level = '', service = mediaBankService, staticAssets = null, isAdmin = false, onImage, onText, onWebImage, onIndex }) {
  const [tab, setTab] = useState('images');
  const [query, setQuery] = useState('');
  const [lvl, setLvl] = useState(LEVELS.includes(level) ? level : '');
  const [state, setState] = useState({ loading: true, error: '', items: [] });
  const [open, setOpen] = useState('');
  const [extras, setExtras] = useState({ gaps: true, wordorder: false, vocab: false });
  const [indexing, setIndexing] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => service.list())
      .then((items) => { if (alive) setState({ loading: false, error: '', items }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error.message || 'Panka ei saanud laadida.', items: [] }); });
    return () => { alive = false; };
  }, [service, reload]);
  const all = useMemo(() => {
    const own = state.items;
    const art = (staticAssets || textbookArtAssets()).filter((asset) => !own.some((item) => item.id === asset.key || item.key === asset.key));
    return [...art, ...own];
  }, [staticAssets, state.items]);
  const images = useMemo(() => searchAssets(all, { query, level: lvl, kind: 'image' }), [all, query, lvl]);
  const texts = useMemo(() => searchAssets(all, { query, level: lvl, kind: 'text' }), [all, query, lvl]);

  const runIndex = async () => {
    setIndexing('Loen õppekava…');
    try {
      const result = await onIndex(({ done, total, assets }) => setIndexing(`Tunnid ${done}/${total} · leitud ${assets}`));
      setIndexing(`Valmis: ${result.images} pilti ja ${result.texts} teksti ${result.lessons} tunnist.`);
      setReload((value) => value + 1);
    } catch (error) {
      setIndexing(error.message || 'Panka ei saanud uuendada.');
    }
  };

  return (
    <div className="st-bank">
      <div className="ed-seg" role="tablist" aria-label="Pank">
        {[['images', `Pildid (${images.length})`], ['texts', `Tekstid (${texts.length})`], ['web', 'Internet']].map(([key, label]) => (
          <button type="button" role="tab" key={key} aria-pressed={tab === key} className={tab === key ? 'is-active' : ''} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {tab === 'web' ? <ImageSearch onPick={onWebImage} /> : <>
        <input className="ed-input" type="search" aria-label="Otsi pangast" placeholder={tab === 'images' ? 'Otsi: kass, pood, hommik…' : 'Otsi: perekond, töö, ilm…'} value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="st-bank__levels" role="group" aria-label="Tase">
          <button type="button" aria-pressed={!lvl} className={!lvl ? 'is-active' : ''} onClick={() => setLvl('')}>Kõik</button>
          {LEVELS.map((item) => <button type="button" key={item} aria-pressed={lvl === item} className={lvl === item ? 'is-active' : ''} onClick={() => setLvl(lvl === item ? '' : item)}>{item}</button>)}
        </div>
        {state.error ? <p className="ed-hint" role="alert">{state.error}</p> : null}
        {state.loading ? <p className="ed-hint">Laen panka…</p> : null}
        {tab === 'images' ? (
          images.length ? <div className="st-bank__grid">{images.slice(0, 60).map((asset) => (
            <button type="button" key={asset.key || asset.id} title={asset.caption || asset.topic || ''} aria-label={`Lisa pilt: ${asset.caption || asset.topic || 'pilt'}`} onClick={() => onImage(asset)}>
              <img src={asset.src} alt="" loading="lazy" />
              {asset.level ? <span>{asset.level}</span> : null}
            </button>
          ))}</div> : !state.loading ? <p className="ed-hint">Pilte ei leitud. Proovi teist sõna, „Kõik” taset või „Internet”.</p> : null
        ) : (
          texts.length ? <ul className="st-bank__texts">{texts.slice(0, 60).map((asset) => {
            const id = asset.key || asset.id;
            return <li key={id}>
              <button type="button" className="st-bank__text" aria-expanded={open === id} onClick={() => setOpen(open === id ? '' : id)}>
                <strong>{asset.title}</strong><small>{[asset.level, `${asset.words} sõna`, asset.textType === 'dialogue' ? 'dialoog' : '', asset.topic].filter(Boolean).join(' · ')}</small>
              </button>
              {open === id ? <div className="st-bank__preview">
                <p>{asset.text.slice(0, 700)}{asset.text.length > 700 ? '…' : ''}</p>
                <div className="st-bank__extras">{EXTRAS.map(([key, label]) => <label key={key}><input type="checkbox" checked={extras[key]} onChange={(event) => setExtras({ ...extras, [key]: event.target.checked })} /> {label}</label>)}</div>
                <button type="button" className="ed-btn is-primary" onClick={() => onText(asset, EXTRAS.map(([key]) => key).filter((key) => extras[key]))}>Lisa lehele</button>
              </div> : null}
            </li>;
          })}</ul> : !state.loading ? <p className="ed-hint">Tekste ei leitud. {isAdmin ? 'Uuenda panka õppekavast.' : ''}</p> : null
        )}
      </>}
      {isAdmin && onIndex ? <div className="st-bank__admin">
        <button type="button" className="ed-btn" disabled={Boolean(indexing) && !/^Valmis|ei saanud/.test(indexing)} onClick={runIndex}>Uuenda panka õppekavast</button>
        {indexing ? <span className="ed-hint" role="status">{indexing}</span> : null}
      </div> : null}
    </div>
  );
}
