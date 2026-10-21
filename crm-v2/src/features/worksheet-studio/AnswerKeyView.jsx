// „Õpetaja võti”: the teacher's answer key of the sheet — every task, the right answer of each item and, when the sheet
// has it, why that answer is right (engine/answerKey.js). Teachers only: the studio is not a student page.
import { answerKeyOf } from './engine/answerKey.js';

export default function AnswerKeyView({ doc }) {
  const tasks = answerKeyOf(doc);
  const explained = tasks.reduce((n, t) => n + t.items.filter((it) => it.why).length, 0);
  const total = tasks.reduce((n, t) => n + t.items.length, 0);
  return (
    <article className="ws-key" aria-label="Õpetaja võti">
      <header className="ws-key-head">
        <span>Õpetaja võti · ainult õpetajale</span>
        <h2>{doc?.meta?.title}</h2>
        {doc?.meta?.displayLabel ? <p>{doc.meta.displayLabel}{doc.meta.level ? ` · ${doc.meta.level}` : ''}</p> : null}
        <small>{total} vastust{total ? ` · selgitusega ${explained}` : ''}</small>
      </header>
      {tasks.length ? tasks.map((task, ti) => (
        <section key={task.id} className="ws-key-task">
          <h3><b>{ti + 1}</b> {task.title}</h3>
          {task.instruction ? <p className="ws-key-instr">{task.instruction}</p> : null}
          <ol>
            {task.items.map((it) => (
              <li key={it.n}>
                {it.prompt ? <span className="ws-key-prompt">{it.prompt}</span> : null}
                <span className="ws-key-answer">{it.answer || '—'}</span>
                {it.why ? <span className="ws-key-why">{it.why}</span> : null}
              </li>
            ))}
          </ol>
        </section>
      )) : <p className="ws-key-empty">Sellel lehel pole kontrollitavaid ülesandeid.</p>}
    </article>
  );
}
