import { Lightbulb } from 'lucide-react';
import { Md } from './engine/ui.jsx';

// The learner's mistakes after hand-in (engine/mistakes.js): per task what she wrote, the right answer and why.
// mistakes: mistakesOf(doc, answers, results).
export default function MistakesPanel({ mistakes }) {
  const tasks = mistakes?.tasks || [];
  if (!tasks.length) return null;
  const count = tasks.reduce((n, t) => n + t.wrong.length, 0);
  return (
    <section className="ws-mistakes" aria-label="Vead ja selgitused">
      <header>
        <Lightbulb size={20} aria-hidden="true" />
        <div>
          <strong>Vead ja selgitused</strong>
          <span>{count === 1 ? '1 vastus vajab parandamist.' : `${count} vastust vajavad parandamist.`} Loe selgitus ja proovi aru saada, miks.</span>
        </div>
      </header>
      <ol className="ws-mistakes-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <b className="ws-mistakes-task">Ülesanne {task.num}{task.title ? <> · <Md text={task.title} /></> : null}</b>
            <ul>
              {task.wrong.map((w) => (
                <li key={w.key} className="ws-mistake">
                  {w.prompt ? <span className="ws-mistake-prompt"><Md text={w.prompt} /></span> : null}
                  <span className="ws-mistake-given">Sinu vastus: {w.given ? <Md text={w.given} /> : '—'}</span>
                  {w.right ? <span className="ws-mistake-right">Õige vastus: <Md text={w.right} /></span> : null}
                  {w.why ? <span className="ws-mistake-why"><b>Miks:</b> <Md text={w.why} /></span> : null}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
