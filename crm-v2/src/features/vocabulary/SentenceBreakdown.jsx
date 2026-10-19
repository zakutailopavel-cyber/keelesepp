import { useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { languageToolsService } from '../../services/firebase/languageTools.js';
import './sentenceBreakdown.css';

// „Lause lahti” (owner 2026-10-19, after sonastik.app): a sentence taken apart — every word with its base form under
// it (coloured by part of speech), a tap shows the form and a gloss, the multi-word verbs („aru saama”) with what they
// govern, and the translation of the whole sentence. The analysis comes from languageApi /analyze (EKI + TartuNLP).

const POS_CLASS = { S: 'noun', H: 'noun', V: 'verb', A: 'adj', C: 'adj', U: 'adj', G: 'adj' };
const lower = (value) => String(value || '').toLocaleLowerCase('et');
// a word and the punctuation after it stay on one line (a comma never starts a line); an opening quote joins the next word
const OPENING = /^[([«„“]$/;
function groups(tokens) {
  const out = [];
  let pending = [];
  tokens.forEach((token, index) => {
    if (token.punct && OPENING.test(token.text)) { pending.push(index); return; }
    if (token.punct && out.length && !pending.length) { out[out.length - 1].push(index); return; }
    out.push([...pending, index]);
    pending = [];
  });
  if (pending.length) out.push(pending);
  return out;
}

export function SentenceBreakdown({ data }) {
  const [picked, setPicked] = useState(null);
  const tokens = data?.tokens || [];
  const expressions = data?.expressions || [];
  const inExpression = new Set(expressions.flatMap((item) => item.tokens));
  const word = picked === null ? null : tokens[picked];
  const expression = picked === null ? null : expressions.find((item) => item.tokens.includes(picked));
  return (
    <div className="sb-lause">
      <h3 className="sb-lause__heading">Sõnad lauses</h3>
      <div className="sb-lause__words">
        {groups(tokens).map((group) => (
          <span key={group[0]} className="sb-lause__group">
            {group.map((index) => {
              const token = tokens[index];
              return token.punct
                ? <span key={index} className="sb-lause__punct">{token.text}</span>
                : <button type="button" key={index} aria-pressed={picked === index}
                  className={`sb-lause__word is-${inExpression.has(index) ? 'phrase' : POS_CLASS[token.pos] || 'other'}${picked === index ? ' is-picked' : ''}`}
                  onClick={() => setPicked(picked === index ? null : index)}>
                  <span className="sb-lause__text">{token.text}</span>
                  <small className="sb-lause__lemma">{lower(token.lemma) !== lower(token.text) ? token.lemma : '\u00a0'}</small>
                </button>;
            })}
          </span>
        ))}
      </div>
      {word ? (
        <div className="sb-lause__detail" role="status">
          <p><strong>{word.text}</strong> → <b>{word.lemma}</b>{word.gloss ? <> — <i>{word.gloss}</i></> : null}{word.level ? <span className="sb-lause__level">{word.level}</span> : null}</p>
          <p className="sb-lause__muted">{[word.posEt, word.posRu].filter(Boolean).join(' · ')}</p>
          {word.formEt || word.formRu ? <p>{word.formEt}{word.formRu ? <><br /><span className="sb-lause__muted">{word.formRu}</span></> : null}</p> : null}
          {expression ? <p className="sb-lause__muted">Osa väljendist „{expression.phrase}”.</p> : null}
        </div>
      ) : <p className="sb-lause__hint">Puuduta sõna: näed algvormi, vormi ja tõlget.</p>}
      {expressions.length ? <>
        <h3 className="sb-lause__heading">Väljendid</h3>
        <ul className="sb-lause__phrases">
          {expressions.map((item) => (
            <li key={item.phrase}>
              <span className="sb-lause__phrase-icon" aria-hidden="true">∿</span>
              <span><strong>{item.phrase}</strong><small>{item.ru}</small>{item.government ? <small className="sb-lause__gov">rektsioon: {item.government}</small> : null}</span>
            </li>
          ))}
        </ul>
      </> : null}
      {data?.translation ? <>
        <h3 className="sb-lause__heading">Tõlge</h3>
        <p className="sb-lause__translation">{data.translation}</p>
      </> : null}
      <p className="sb-lause__source">Allikas: {data?.source || 'EKI etLex, TartuNLP'}. Masin võib eksida — kahtluse korral küsi õpetajalt.</p>
    </div>
  );
}

// the box: a sentence (typed in or taken from a worksheet) → its breakdown
export default function SentenceAnalyzer({ initialText = '', autoRun = false, service = languageToolsService, tgt = 'ru' }) {
  const [text, setText] = useState(initialText);
  const starting = Boolean(autoRun && String(initialText || '').trim());
  const [state, setState] = useState({ loading: starting, error: '', data: null });
  const ask = (clean) => service.analyzeSentence({ text: clean, tgt })
    .then((data) => setState({ loading: false, error: '', data }))
    .catch((error) => setState({ loading: false, error: error.message || 'Lauset ei saanud lahti võtta.', data: null }));
  const run = () => {
    const clean = String(text || '').trim();
    if (!clean) return;
    setState({ loading: true, error: '', data: null });
    ask(clean);
  };
  // opened from a worksheet word: the sentence is taken apart at once
  useEffect(() => { if (starting) ask(String(initialText).trim()); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="sb-lause-box">
      <form className="sb-lause__form" onSubmit={(event) => { event.preventDefault(); run(); }}>
        <label className="sb-lause__label" htmlFor="sb-lause-input">Kirjuta või kleebi eestikeelne lause</label>
        <textarea id="sb-lause-input" rows={2} maxLength={400} value={text} placeholder="Näiteks: Ma saan kõigest aru, aga midagi öelda ei oska." onChange={(event) => setText(event.target.value)} />
        <button type="submit" className="vw-btn is-primary" disabled={state.loading || !text.trim()}>
          {state.loading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />} Võta lause lahti
        </button>
      </form>
      {state.error ? <p className="sb-lause__error" role="alert">{state.error}</p> : null}
      {state.loading ? <p className="sb-lause__hint">Otsin sõnade algvorme ja tõlget…</p> : null}
      {state.data ? <SentenceBreakdown data={state.data} /> : null}
    </div>
  );
}
