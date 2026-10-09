import { BLOCKS, COLUMN_BLOCKS, SHUFFLE_BLOCKS } from '../engine/registry.js';
import { TONES } from '../engine/schema.js';
import { Text, Area, Select } from './fields.jsx';
import { THEMES } from '../engine/look.js';
import AiSentences from './AiSentences.jsx';
import AiReading from './AiReading.jsx';
import SentenceFlags from './SentenceFlags.jsx';
import GrammarPanel from './GrammarPanel.jsx';
import EkiEvaluation from './EkiEvaluation.jsx';

// Settings of the selected block (the floating panel) and of the whole sheet („Leht”).
// The look of a block (style, colour, frame, icon, width) is edited from its bar on the sheet (BlockBar.jsx); this
// panel keeps what the block says: task settings, title, instruction, goal and the block's own fields.
export function BlockInspector({ block, doc, update }) {
  const def = BLOCKS[block.type];
  const set = (patch) => update({ ...block, data: { ...block.data, ...patch } });
  const setOpts = (patch) => {
    const next = { ...(block.opts || {}), ...patch };
    Object.keys(next).forEach((key) => { if (!next[key] || (key === 'cols' && next[key] === 1)) delete next[key]; });
    const { opts, ...rest } = block; // eslint-disable-line no-unused-vars
    update(Object.keys(next).length ? { ...rest, opts: next } : rest);
  };
  const goals = Object.entries(doc.meta.goals || {});
  return (
    <div className="ed-inspector">
      {def.task && (COLUMN_BLOCKS.has(block.type) || def.example || SHUFFLE_BLOCKS.has(block.type)) && (
        <div className="ed-section">
          <span className="ed-label">Ülesande seaded</span>
          {COLUMN_BLOCKS.has(block.type) && (
            <div className="ed-opt"><span>Veerud</span><div className="ed-seg" role="group" aria-label="Veerud">
              {[1, 2, 3].map((n) => <button type="button" key={n} aria-pressed={(block.opts?.cols || 1) === n} className={(block.opts?.cols || 1) === n ? 'on' : ''} onClick={() => setOpts({ cols: n })}>{n}</button>)}
            </div></div>
          )}
          <div className="ed-opt"><span>Kirja suurus</span><div className="ed-seg" role="group" aria-label="Kirja suurus">
            {[['small', 'Väike'], ['', 'Tavaline'], ['large', 'Suur']].map(([v, l]) => <button type="button" key={l} aria-pressed={(block.opts?.size || '') === v} className={(block.opts?.size || '') === v ? 'on' : ''} onClick={() => setOpts({ size: v })}>{l}</button>)}
          </div></div>
          {def.example ? <label className="ed-check"><input type="checkbox" checked={Boolean(block.opts?.example)} onChange={(e) => setOpts({ example: e.target.checked })} /> Esimene ülesanne on lahendatud näide („Näide”)</label> : null}
          {block.type === 'choice' ? <label className="ed-check"><input type="checkbox" checked={!block.opts?.keepOrder} onChange={(e) => setOpts({ keepOrder: !e.target.checked })} /> Sega vastusevariandid</label>
            : SHUFFLE_BLOCKS.has(block.type) ? <label className="ed-check"><input type="checkbox" checked={Boolean(block.opts?.shuffle)} onChange={(e) => setOpts({ shuffle: e.target.checked })} /> Sega vastusevariandid</label> : null}
        </div>
      )}

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

      {block.type === 'reading' ? <div className="ed-section"><AiReading meta={doc.meta} onUse={(patch) => set(patch)} /></div> : null}
      {block.type === 'gaps' ? <div className="ed-section"><AiSentences meta={doc.meta} onAdd={(lines) => set({ sentences: [String(block.data.sentences || '').trim(), ...lines].filter(Boolean).join('\n') })} /></div> : null}
      <div className="ed-section"><def.Editor data={block.data} set={set} /></div>
      {block.type === 'gaps' || block.type === 'wordorder' ? <div className="ed-section"><SentenceFlags sentences={block.data.sentences} docId={doc.id} blockType={block.type} onRemove={(line) => set({ sentences: String(block.data.sentences || '').split('\n').filter((x) => x !== line).join('\n') })} /></div> : null}
    </div>
  );
}

export function SheetInspector({ doc, setMeta, evaluate = null }) {
  const m = doc.meta;
  const goals = Object.entries(m.goals || {});
  const setGoals = (entries) => setMeta({ goals: Object.fromEntries(entries.filter(([, g]) => g !== null)) });
  return (
    <div className="ed-inspector">
      <div className="ed-inspector-head"><b>Töölehe andmed</b></div>
      <div className="ed-section">
        <span className="ed-label">Lehe teema</span>
        <div className="ed-presets" role="group" aria-label="Lehe teema">
          {THEMES.map((theme) => (
            <button type="button" key={theme.key || 'book'} aria-pressed={(m.theme || '') === theme.key} className={`ed-preset ${(m.theme || '') === theme.key ? 'on' : ''}`} style={{ background: (theme.tones?.blue || TONES.blue).card, borderColor: (theme.tones?.blue || TONES.blue).badge }} onClick={() => setMeta({ theme: theme.key || undefined })}>{theme.label}</button>
          ))}
        </div>
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
      <div className="ed-section"><EkiEvaluation doc={doc} evaluate={evaluate} /></div>
      <div className="ed-section"><GrammarPanel level={m.level} /></div>
    </div>
  );
}
