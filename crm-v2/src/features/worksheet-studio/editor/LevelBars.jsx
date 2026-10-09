const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
// shares per CEFR level as one coloured bar (EKI text evaluation)
export default function LevelBars({ rows }) {
  return rows.map(([name, levels]) => {
    const total = LEVELS.reduce((n, l) => n + (levels?.[l] || 0), 0) || 1;
    return (
      <div key={name} className="ed-eki__row"><small>{name}</small><div className="ed-eki__bar">{LEVELS.map((l) => ({ l, pct: Math.round(((levels?.[l] || 0) / total) * 100) })).filter((x) => x.pct).map((x) => <i key={x.l} className={`lv-${x.l}`} style={{ width: `${x.pct}%` }} title={`${x.l} ${x.pct}%`}>{x.pct >= 12 ? x.l : ''}</i>)}</div></div>
    );
  });
}
