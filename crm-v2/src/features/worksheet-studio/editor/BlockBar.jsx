import * as Icons from 'lucide-react';
import BarMenu from './BarMenu.jsx';
import { BLOCKS } from '../engine/registry.js';
import { TONES, TONE_ORDER } from '../engine/schema.js';
import { SPAN_PRESETS, spanOf, withHeight, withSpan } from '../engine/layout.js';
import { FRAMES, HEADS, LOOK_ICONS, NUMS, STYLE_PRESETS, withLook, withStyle } from '../engine/look.js';

const ICON_OF = { speak: 'MessageCircle', listen: 'Headphones', read: 'BookOpen', write: 'PenLine', idea: 'Lightbulb', star: 'Star', time: 'Clock3', check: 'CheckCircle2' };

function Chips({ items, value, onPick, label }) {
  return (
    <div className="ws-bm-chips" role="group" aria-label={label}>
      {items.map(([v, l]) => <button type="button" key={l} aria-pressed={value === v} className={value === v ? 'on' : ''} onClick={() => onPick(v)}>{l}</button>)}
    </div>
  );
}

/**
 * The look of one block, edited from its dark bar on the sheet (Canva-like): ready styles, colours, frame and
 * heading, icon, width and placement. Each opens a small menu; the change is one undo step.
 */
export default function BlockLookMenus({ block, update, onOpen, copiedStyle, onCopyStyle, onStyleAll }) {
  const def = BLOCKS[block.type] || {};
  const look = block.look || {};
  const toggle = (key, on) => { const next = { ...block }; if (on) next[key] = true; else delete next[key]; update(next); };
  return (
    <>
      <BarMenu label="Stiil" icon={<Icons.Palette aria-hidden="true" />} title="Valmis stiilid" onOpen={onOpen} className="is-styles">
        {(close) => (
          <>
            <div className="ws-bm-title">Valmis stiil</div>
            <div className="ws-bm-presets">
              {STYLE_PRESETS.map((preset) => {
                const tone = TONES[preset.tone] || TONES.white;
                const accent = (TONES[preset.look?.accent] || tone).badge;
                return (
                  <button type="button" role="menuitem" key={preset.key} onClick={() => { update(withStyle(block, preset)); close(); }}>
                    <span className={`ws-bm-sample frame-${preset.look?.frame || 'none'} head-${preset.look?.head || 'plain'}`} style={{ background: tone.card, '--sample': accent }} aria-hidden="true"><i /><b /><b /></span>
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className="ws-bm-sep" />
            <button type="button" role="menuitem" className="ws-bm-item" onClick={() => { onCopyStyle(); close(); }}><Icons.Copy aria-hidden="true" /> Kopeeri stiil</button>
            {copiedStyle ? <button type="button" role="menuitem" className="ws-bm-item" onClick={() => { update(withStyle(block, copiedStyle)); close(); }}><Icons.ClipboardPaste aria-hidden="true" /> Kleebi stiil</button> : null}
            <button type="button" role="menuitem" className="ws-bm-item" onClick={() => { onStyleAll(); close(); }}><Icons.CopyCheck aria-hidden="true" /> Kõigile sama tüüpi</button>
          </>
        )}
      </BarMenu>
      <BarMenu ariaLabel="Värv" title="Taust ning pealkirja ja raami värv" icon={<span className="ws-bar-swatch" style={{ background: (TONES[block.tone] || TONES.white).card, borderColor: look.accent ? TONES[look.accent]?.badge : undefined }} aria-hidden="true" />} onOpen={onOpen}>
        <div className="ws-bm-title">Taust</div>
        <div className="ws-bm-swatches">
          {TONE_ORDER.map((t) => <button type="button" key={t} aria-label={`Taust: ${TONES[t].label}`} title={TONES[t].label} className={block.tone === t ? 'on' : ''} style={{ background: TONES[t].card }} onClick={() => update({ ...block, tone: t })} />)}
        </div>
        <div className="ws-bm-title">Pealkiri ja raam</div>
        <div className="ws-bm-swatches">
          <button type="button" aria-label="Ploki toon" title="Ploki toon" className={!look.accent ? 'on is-auto' : 'is-auto'} onClick={() => update(withLook(block, { accent: '' }))}>A</button>
          {TONE_ORDER.filter((t) => t !== 'white' && t !== 'cream').map((t) => <button type="button" key={t} aria-label={`Värv ${TONES[t].label}`} title={TONES[t].label} className={look.accent === t ? 'on' : ''} style={{ background: TONES[t].badge }} onClick={() => update(withLook(block, { accent: t }))} />)}
        </div>
      </BarMenu>
      <BarMenu ariaLabel="Raam" title="Raam, pealkiri ja number" icon={<Icons.SquareDashed aria-hidden="true" />} onOpen={onOpen}>
        <div className="ws-bm-title">Raam</div>
        <Chips label="Raam" items={FRAMES} value={look.frame || ''} onPick={(v) => update(withLook(block, { frame: v }))} />
        {def.task ? <>
          <div className="ws-bm-title">Pealkiri</div>
          <Chips label="Pealkirja kuju" items={HEADS} value={look.head || ''} onPick={(v) => update(withLook(block, { head: v }))} />
          <div className="ws-bm-title">Number</div>
          <Chips label="Numbri kuju" items={NUMS} value={look.num || ''} onPick={(v) => update(withLook(block, { num: v }))} />
        </> : null}
      </BarMenu>
      <BarMenu ariaLabel="Ikoon" title="Ikoon pealkirja ees" icon={(() => { const Ico = Icons[ICON_OF[look.icon]] || Icons.Smile; return <Ico aria-hidden="true" />; })()} onOpen={onOpen}>
        <div className="ws-bm-title">Ikoon</div>
        <div className="ws-bm-icons" role="group" aria-label="Ikoon">
          {LOOK_ICONS.map(([value, label]) => {
            const Ico = Icons[ICON_OF[value]] || Icons.Ban;
            return <button type="button" key={label} aria-pressed={(look.icon || '') === value} className={(look.icon || '') === value ? 'on' : ''} title={label} onClick={() => update(withLook(block, { icon: value }))}><Ico aria-hidden="true" /><span>{label}</span></button>;
          })}
        </div>
      </BarMenu>
      <BarMenu ariaLabel="Laius ja paigutus" title="Laius, kõrgus ja paigutus" icon={<Icons.Columns3 aria-hidden="true" />} onOpen={onOpen}>
        <div className="ws-bm-title">Laius lehel</div>
        <div className="ws-bm-chips" role="group" aria-label="Laius lehel">
          {SPAN_PRESETS.map(({ span, label }) => <button type="button" key={span} aria-pressed={spanOf(block) === span} className={spanOf(block) === span ? 'on' : ''} onClick={() => update(withSpan(block, span))}>{label}</button>)}
        </div>
        <div className="ws-bm-title">Kõrgus</div>
        <div className="ws-bm-chips">
          <button type="button" className={block.minHeightMm ? '' : 'on'} aria-pressed={!block.minHeightMm} onClick={() => update(withHeight(block, 0))}>Automaatne</button>
          <label className="ws-bm-mm"><input type="number" min="20" max="330" step="5" aria-label="Kõrgus millimeetrites" value={block.minHeightMm || ''} placeholder="—" onChange={(e) => update(withHeight(block, Number(e.target.value) || 0))} /> mm</label>
        </div>
        <div className="ws-bm-sep" />
        <label className="ws-bm-check"><input type="checkbox" checked={Boolean(block.joined)} onChange={(e) => toggle('joined', e.target.checked)} /> Seo eelmise plokiga</label>
        <label className="ws-bm-check"><input type="checkbox" checked={Boolean(block.pageBreakBefore)} onChange={(e) => toggle('pageBreakBefore', e.target.checked)} /> Alusta uuelt lehelt</label>
      </BarMenu>
    </>
  );
}
