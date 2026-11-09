import { Volume2 } from 'lucide-react';
import { TYPE_LABELS, fullSentence, inputOf } from './engine/items.js';
import { speakEstonian } from './engine/speech.js';

// What the learner sees above the answer: the task in one line (Estonian, with the learner's language under it), then
// the sentence with its gap, the sentence to rewrite with its cue, or the play button of a listening item.
export function ItemPrompt({ item, lang = 'ru', filled = '' }) {
  const label = TYPE_LABELS[item.type] || TYPE_LABELS.form;
  const input = inputOf(item);
  return (
    <div className="pr-prompt">
      <p className="pr-prompt__task">
        <strong>{item.type === 'transform' && item.fix ? 'Paranda viga' : label.et}</strong>
        {lang !== 'et' && label[lang] ? <span lang={lang}>{item.type === 'transform' && item.fix ? (lang === 'ru' ? 'Исправь ошибку' : 'Fix the mistake') : label[lang]}</span> : null}
      </p>
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
  const say = (rate) => speakEstonian(fullSentence(item), { rate });
  return (
    <div className="pr-listen">
      <button type="button" className="pr-listen__play" onClick={() => say(0.9)} aria-label="Kuula lauset">
        <Volume2 size={30} aria-hidden="true" />
      </button>
      <button type="button" className="pr-listen__slow" onClick={() => say(0.65)}>Aeglaselt</button>
    </div>
  );
}
