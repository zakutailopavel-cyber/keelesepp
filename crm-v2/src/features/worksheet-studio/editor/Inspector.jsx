import { BLOCKS, COLUMN_BLOCKS, SHUFFLE_BLOCKS } from '../engine/registry.js';
import { TONES, TONE_ORDER } from '../engine/schema.js';
import { Text, Area, Select } from './fields.jsx';
import { SPAN_PRESETS, spanOf, withHeight, withSpan } from '../engine/layout.js';
import { FRAMES, HEADS, LOOK_ICONS, NUMS, STYLE_PRESETS, THEMES, withLook, withStyle } from '../engine/look.js';

// Right panel: settings of the selected block, or of the whole sheet when nothing is selected.

export function BlockInspector({ block, doc, update, onDelete, onDuplicate, onMove }) {
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
        <span className="ed-label">Laius lehel <small>(või lohista ploki paremat serva)</small></span>
        <div className="ed-seg ed-seg--spans" role="group" aria-label="Laius lehel">
          {SPAN_PRESETS.map(({ span, label }) => (
            <button type="button" key={span} aria-pressed={spanOf(block) === span} className={spanOf(block) === span ? 'on' : ''} onClick={() => update(withSpan(block, span))}>{label}</button>
          ))}
        </div>
        <span className="ed-label">Kõrgus <small>(või lohista alumist serva)</small></span>
        <div className="ed-row ed-height">
          <button type="button" className={`ed-btn ${block.minHeightMm ? 'ghost' : 'on'}`} aria-pressed={!block.minHeightMm} onClick={() => update(withHeight(block, 0))}>Automaatne</button>
          <label><input type="number" min="20" max="330" step="5" aria-label="Kõrgus millimeetrites" value={block.minHeightMm || ''} placeholder="mm" onChange={(e) => update(withHeight(block, Number(e.target.value) || 0))} /> mm</label>
        </div>
        <span className="ed-label">Valmis stiil</span>
        <div className="ed-presets" role="group" aria-label="Valmis stiil">
          {STYLE_PRESETS.map((preset) => (
            <button type="button" key={preset.key} className={`ed-preset tone-${preset.tone}`} style={{ background: TONES[preset.tone].card, borderColor: TONES[preset.look.accent || preset.tone].badge }} onClick={() => update(withStyle(block, preset))}>{preset.label}</button>
          ))}
        </div>
        <span className="ed-label">Värv (ainult brändi toonid)</span>
        <div className="ed-tones">
          {TONE_ORDER.map((t) => (
            <button type="button" key={t} title={TONES[t].label} className={block.tone === t ? 'on' : ''} style={{ background: TONES[t].card }} onClick={() => update({ ...block, tone: t })} />
          ))}
        </div>
        <span className="ed-label">Raam</span>
        <div className="ed-seg" role="group" aria-label="Raam">
          {FRAMES.map(([value, label]) => <button type="button" key={label} aria-pressed={(block.look?.frame || '') === value} className={(block.look?.frame || '') === value ? 'on' : ''} onClick={() => update(withLook(block, { frame: value }))}>{label}</button>)}
        </div>
        <span className="ed-label">Pealkirja ja raami värv</span>
        <div className="ed-tones" role="group" aria-label="Pealkirja ja raami värv">
          <button type="button" title="Ploki toon" className={!block.look?.accent ? 'on' : ''} style={{ background: '#fff' }} onClick={() => update(withLook(block, { accent: '' }))}>–</button>
          {TONE_ORDER.filter((t) => t !== 'white' && t !== 'cream').map((t) => (
            <button type="button" key={t} title={TONES[t].label} aria-label={`Värv ${TONES[t].label}`} className={block.look?.accent === t ? 'on' : ''} style={{ background: TONES[t].badge }} onClick={() => update(withLook(block, { accent: t }))} />
          ))}
        </div>
        {def.task ? <>
          <span className="ed-label">Pealkiri</span>
          <div className="ed-seg" role="group" aria-label="Pealkirja kuju">
            {HEADS.map(([value, label]) => <button type="button" key={label} aria-pressed={(block.look?.head || '') === value} className={(block.look?.head || '') === value ? 'on' : ''} onClick={() => update(withLook(block, { head: value }))}>{label}</button>)}
          </div>
          <span className="ed-label">Number</span>
          <div className="ed-seg" role="group" aria-label="Numbri kuju">
            {NUMS.map(([value, label]) => <button type="button" key={label} aria-pressed={(block.look?.num || '') === value} className={(block.look?.num || '') === value ? 'on' : ''} onClick={() => update(withLook(block, { num: value }))}>{label}</button>)}
          </div>
        </> : null}
        <span className="ed-label">Ikoon</span>
        <div className="ed-seg ed-seg--wrap" role="group" aria-label="Ikoon">
          {LOOK_ICONS.map(([value, label]) => <button type="button" key={label} aria-pressed={(block.look?.icon || '') === value} className={(block.look?.icon || '') === value ? 'on' : ''} onClick={() => update(withLook(block, { icon: value }))}>{label}</button>)}
        </div>
        <label className="ed-check"><input type="checkbox" checked={Boolean(block.joined)} onChange={(e) => { const next = { ...block }; if (e.target.checked) next.joined = true; else delete next.joined; update(next); }} /> Seo eelmise plokiga (üks kaart, liiguvad koos)</label>
        <label className="ed-check"><input type="checkbox" checked={Boolean(block.pageBreakBefore)} onChange={(e) => { const next = { ...block }; if (e.target.checked) next.pageBreakBefore = true; else delete next.pageBreakBefore; update(next); }} /> Alusta seda plokki uuelt lehelt</label>
      </div>

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
          {SHUFFLE_BLOCKS.has(block.type) ? <label className="ed-check"><input type="checkbox" checked={Boolean(block.opts?.shuffle)} onChange={(e) => setOpts({ shuffle: e.target.checked })} /> Sega vastusevariandid</label> : null}
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
    </div>
  );
}
