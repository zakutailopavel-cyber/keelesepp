// Result per lesson goal: what the learner showed for each "Ma oskan …" goal of the sheet.
// `evidence` comes from checkDocument (or a stored assignment score plus the answers).
export default function GoalEvidence({ doc, evidence, title = 'Tulemus tunni eesmärkide kaupa' }) {
  const perGoal = evidence?.perGoal || {};
  const speak = evidence?.speak || [];
  return (
    <section className="st-evidence">
      <h4>{title}</h4>
      {Object.entries(doc.meta?.goals || {}).map(([id, label]) => {
        const g = perGoal[id];
        const sp = speak.find((s) => s.goal === id);
        const txt = g ? `${g.ok} / ${g.total}` : sp ? (sp.recorded ? `salvestus ${sp.seconds} s — hindab õpetaja` : 'salvestus puudub') : '—';
        return <div className="st-ev" key={id}><span>{label}</span><b>{txt}</b></div>;
      })}
      {perGoal._none && <div className="st-ev"><span>Eesmärgiga sidumata ülesanded</span><b>{perGoal._none.ok} / {perGoal._none.total}</b></div>}
      <div className="st-ev"><span>Mitme õige vastusega ülesanded, kõne ja enesehinnang</span><b>näeb õpetaja</b></div>
    </section>
  );
}
