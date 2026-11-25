import { useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { TYPE_LABELS, fullSentence, inputOf } from './engine/items.js';
import { playEstonian, preloadWordAudio } from '../vocabulary/wordAudio.js';

// What the learner sees above the answer: the task in one line (Estonian, with the learner's language under it), then
// the sentence with its gap, the sentence to rewrite with its cue, or the play button of a listening item. A picture item
// shows its word picture; a sentence item of a course lesson with art shows the lesson's scene above it.
export function ItemPrompt({ item, lang = 'ru', filled = '' }) {
  const label = TYPE_LABELS[item.type] || TYPE_LABELS.form;
  const input = inputOf(item);
  return (
    <div className="pr-prompt">
      <p className="pr-prompt__task">
        <strong>{item.type === 'transform' && item.fix ? 'Paranda viga' : label.et}</strong>
        {lang !== 'et' && label[lang] ? <span lang={lang}>{item.type === 'transform' && item.fix ? (lang === 'ru' ? 'Исправь ошибку' : 'Fix the mistake') : label[lang]}</span> : null}
      </p>
      {item.scene?.src ? <figure className="pr-scene"><img src={item.scene.src} alt={item.scene.alt || ''} loading="lazy" decoding="async" /></figure> : null}
      {item.type === 'picture' ? <figure className="pr-picture"><img src={item.picture?.src} alt="Pilt: mis sõna see on?" decoding="async" /></figure> : null}
      {item.type === 'hear' ? <HearButton word={item.word} /> : null}
      {item.type === 'listen' ? <ListenButton item={item} /> : null}
      {item.type === 'transform' ? (
        <div className="pr-source">
          <p className="pr-source__text" lang="et">{item.from}</p>
          {item.cue ? <p className="pr-source__cue"><span aria-hidden="true">→</span> <span lang="et">{item.cue}</span></p> : null}
          {input === 'tiles' ? <p className="pr-source__how">Pane uus lause sõnadest kokku.</p> : null}
        </div>
      ) : null}
      {item.type === 'form' || item.type === 'connector' ? <GapSentence item={item} filled={filled} /> : null}
    </div>
  );
}

function GapSentence({ item, filled }) {
  return (
    <div className="pr-gap-card">
      {item.cue && !item.before && !item.after ? (
        <p className="pr-gap-card__sentence" lang="et"><span className="pr-base-word">{item.base}</span> <span aria-hidden="true">→</span> {item.cue} <Gap filled={filled} /></p>
      ) : (
        <p className="pr-gap-card__sentence" lang="et">
          {item.before ? `${item.before} ` : ''}<Gap filled={filled} />{item.after ? `${/^[.,!?;:…”»)]/.test(item.after) ? '' : ' '}${item.after}` : ''}
        </p>
      )}
      {item.base && (item.before || item.after) ? <p className="pr-gap-card__base">Algvorm: <span lang="et">{item.base}</span></p> : null}
    </div>
  );
}

const Gap = ({ filled }) => <span className={`pr-gap${filled ? ' is-filled' : ''}`} aria-label={filled ? `lünk: ${filled}` : 'lünk'}>{filled || ' '}</span>;

function ListenButton({ item }) {
  // the stored Neurokõne recording when there is one (slowed down for „Aeglaselt”), else the browser's Estonian voice
  const text = fullSentence(item);
  useEffect(() => { preloadWordAudio([text]); }, [text]);
  const say = (slow) => playEstonian(text, { slow });
  return (
    <div className="pr-listen">
      <button type="button" className="pr-listen__play" onClick={() => say(false)} aria-label="Kuula lauset">
        <Volume2 size={30} aria-hidden="true" />
      </button>
      <button type="button" className="pr-listen__slow" onClick={() => say(true)}>Aeglaselt</button>
    </div>
  );
}

// „Kuula ja vali pilt”: the word plays once when the item opens (the tap on „Edasi” allows it), and again on each tap
function HearButton({ word }) {
  const played = useRef('');
  useEffect(() => {
    preloadWordAudio([word]);
    if (played.current === word) return;
    played.current = word;
    playEstonian(word);
  }, [word]);
  return (
    <div className="pr-listen">
      <button type="button" className="pr-listen__play" onClick={() => playEstonian(word)} aria-label="Kuula sõna">
        <Volume2 size={30} aria-hidden="true" />
      </button>
      <button type="button" className="pr-listen__slow" onClick={() => playEstonian(word, { slow: true })}>Aeglaselt</button>
    </div>
  );
}

// After a picture item: the picture, the word, its meaning and the sound (owner 2026-11-25: practice like Duolingo)
export function WordReveal({ item, lang = 'ru' }) {
  const played = useRef('');
  useEffect(() => {
    if (played.current === item.id) return;
    played.current = item.id;
    playEstonian(item.word);
  }, [item.id, item.word]);
  return (
    <div className="pr-reveal">
      <img src={item.picture?.src} alt="" aria-hidden="true" decoding="async" />
      <p className="pr-reveal__text">
        <b lang="et">{item.word}</b>
        {item.meaning ? <span lang={lang === 'en' ? undefined : 'ru'}>{item.meaning}</span> : null}
      </p>
      <button type="button" className="pr-reveal__play" onClick={() => playEstonian(item.word)} aria-label={`Kuula: ${item.word}`}>
        <Volume2 size={22} aria-hidden="true" />
      </button>
    </div>
  );
}
