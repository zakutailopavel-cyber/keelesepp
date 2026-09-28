import { BLOCKS } from '../engine/registry.js';
import { TONES, TONE_ORDER } from '../engine/schema.js';
import { Text, Area, Select } from './fields.jsx';

// Right panel: settings of the selected block, or of the whole sheet when nothing is selected.

export function BlockInspector({ block, doc, update, onDelete, onDuplicate, onMove }) {
  const def = BLOCKS[block.type];
  const set = (patch) => update({ ...block, data: { ...block.data, ...patch } });
  const goals = Object.entries(doc.meta.goals || {});
  return (
    <div className="ed-inspector">
      <div className="ed-inspector-head">
        <b>{def.label}</b>
        <div className="ed-row">
          <button type="button" className="ed-btn ghost" onClick={() => onMove(-1)} title="Üles">↑</button>
          <button type="button" className="ed-btn ghost" onClick={() => onMove(1)} title="Alla">↓</button>
          <button type="button" className="ed-btn ghost" onClick={onDuplicate}>Kopeeri</button>
          <button type="button" className="ed-btn danger" onClick={onDelete}>Kustuta</button>
        </div>
      </div>

      <div className="ed-section">
        <span className="ed-label">Laius lehel</span>
        <div className="ed-seg">
          {[['half', 'Pool lehte'], ['full', 'Terve laius']].map(([v, l]) => (
            <button type="button" key={v} className={block.width === v ? 'on' : ''} onClick={() => update({ ...block, width: v })}>{l}</button>
          ))}
        </div>
        <span className="ed-label">Värv (ainult brändi toonid)</span>
        <div className="ed-tones">
          {TONE_ORDER.map((t) => (
            <button type="button" key={t} title={TONES[t].label} className={block.tone === t ? 'on' : ''} style={{ background: TONES[t].card }} onClick={() => update({ ...block, tone: t })} />
          ))}
        </div>
      </div>

      {def.task && (
        <div className="ed-section">
          <Text label="Pealkiri" value={block.data.title} onChange={(v) => set({ title: v })} />
          <Text label="Pealkirja jätk (valikuline)" value={block.data.titleMore} onChange={(v) => set({ titleMore: v })} />
          <Area label="Juhis" rows={2} value={block.data.instruction} onChange={(v) => set({ instruction: v })} hint="*kaldkiri* tärnide vahel" />
          {goals.length > 0 && (
            <Select label="Tunni eesmärk (tulemus läheb õpilase profiili)" value={block.goal || ''} onChange={(v) => update({ ...block, goal: v || undefined })}
              options={[['', '— pole seotud —'], ...goals.map(([id, g]) => [id, g.length > 60 ? g.slice(0, 58) + '…' : g])]} />
          )}
        </div>
      )}

      <div className="ed-section"><def.Editor data={block.data} set={set} /></div>
    </div>
  );
}

export function SheetInspector({ doc, setMeta }) {
  const m = doc.meta;
  const goals = Object.entries(m.goals || {});
  const setGoals = (entries) => setMeta({ goals: Object.fromEntries(entries.filter(([, g]) => g !== null)) });
  return (
    <div className="ed-inspector">
      <div className="ed-inspector-head"><b>Töölehe andmed</b></div>
      <div className="ed-section">
        <Text label="Pealkiri" value={m.title} onChange={(v) => setMeta({ title: v })} />
        <Text label="Alapealkiri" value={m.subtitle} onChange={(v) => setMeta({ subtitle: v })} />
        <div className="ed-row">
          <Select label="Tase" value={m.level} onChange={(v) => setMeta({ level: v })} options={['A1', 'A2', 'B1', 'B2', 'C1'].map((l) => [l, l])} />
          <Text label="Moodul" value={m.module} onChange={(v) => setMeta({ module: v })} />
        </div>
        <Text label="Ma oskan… (tunni lubadus)" value={m.canDo} onChange={(v) => setMeta({ canDo: v })} />
        <Text label="Taseme kasti tekst" value={m.badge} onChange={(v) => setMeta({ badge: v })} />
      </div>
      <div className="ed-section">
        <span className="ed-label">Tunni eesmärgid</span>
        {goals.map(([id, g], i) => (
          <div className="ed-row" key={id}>
            <input className="ed-input" value={g} onChange={(e) => setGoals(goals.map(([k, v], j) => [k, j === i ? e.target.value : v]))} />
            <button type="button" className="ed-btn ghost" onClick={() => setGoals(goals.map(([k, v], j) => [k, j === i ? null : v]))}>×</button>
          </div>
        ))}
        <button type="button" className="ed-btn ghost" onClick={() => setGoals([...goals, [`g_${Date.now().toString(36)}`, 'Uus eesmärk']])}>+ Lisa eesmärk</button>
        <span className="ed-hint">Iga ülesande saab siduda eesmärgiga. Kontrolli tulemus näitab, milline eesmärk on omandatud.</span>
      </div>
    </div>
  );
}
