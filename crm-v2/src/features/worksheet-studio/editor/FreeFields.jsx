// Settings of one item of the free layer (engine/freeLayer.js): what it shows, its shape and colour, its page, size,
// turn, layer, lock; copy and delete. Every change goes through `set(patch)` → one undoable change of `doc.free`.
import { Area, ImagePick, Num, Select, Text } from './fields.jsx';
import { IMAGE_SHAPES, TAILS, TAIL_LABEL, GROUP_ALIGNS, GROUP_ALIGN_LABEL, OPACITIES, PLACES, PLACE_LABEL, placeOnPage, TEXT_ALIGNS, TEXT_ALIGN_LABEL, TEXT_COLORS, TEXT_COLOR_LABEL, TEXT_FONTS, TEXT_FONT_LABEL, FILL_LABEL, FREE_BORDERS, FREE_FILLS, FREE_SHAPES, HEADS_LABEL, KIND_LABEL, LINE_COLORS, LINE_COLOR_LABEL, LINE_HEADS, LINE_STROKES } from '../engine/freeLayer.js';

const SHAPE_LABEL = { rect: 'Ristkülik', rounded: 'Ümarad nurgad', circle: 'Ring', oval: 'Ovaal', bubble: 'Jutumull', star: 'Täht', burst: 'Kleeps (sakiline)', ribbon: 'Lint' };
const BORDER_LABEL = { none: 'Ilma raamita', ink: 'Must joon', lime: 'Laimiroheline joon' };
const TURNS = [-15, -10, -5, -3, 0, 3, 5, 10, 15, 90, -90];

export default function FreeFields({ item, pages = 1, set, onLayer, onDuplicate, onDelete, onToPage, onClip }) {
  const locked = item.locked === true;
  const guard = (patch) => { if (!locked) set(patch); };
  return (
    <div className="ed-free">
      <p className="ed-hint">{item.kind === 'line' ? 'Joon vabas kihis: lohista joont, et liigutada; rohelised täpid otstes muudavad suunda ja pikkust.' : `${KIND_LABEL[item.kind]} vabas kihis: lohista lehel, suurus nurgast.${item.kind === 'text' ? ' Teksti saab muuta ka otse lehel: topeltklõps (või veel üks puudutus valitud kastil).' : ''}`} Plokid selle alt ei liigu.</p>
      {item.kind === 'image' ? <>
        <ImagePick value={item.img} aspect="orig" allowAspect={false} onChange={(img) => {
          const ratio = img?.width && img?.height ? img.height / img.width : 0;
          set(ratio ? { img, h: Math.round(item.w * ratio * 10) / 10 } : { img });
        }} />
        {item.img?.src ? <>
          <label className="ed-field"><span className="ed-label">Suurendus (kadreerimine): {Math.round((item.zoom || 1) * 100)} %</span>
            <input type="range" min="1" max="4" step="0.05" value={item.zoom || 1} aria-label="Suurendus" onChange={(e) => set({ zoom: Number(e.target.value) })} /></label>
          <p className="ed-hint">Topeltklõps pildil lehel: lohista fotot raamis, − / + suurendab. Fail ise jääb terveks.</p>
          {(item.zoom || 1) > 1 || (item.img?.focus?.x ?? 50) !== 50 || (item.img?.focus?.y ?? 50) !== 50 ? <button type="button" className="ed-btn" onClick={() => set({ zoom: 1, img: { ...item.img, focus: { x: 50, y: 50 } } })}>Tühista kadreerimine</button> : null}
        </> : null}
        <Text label="Alt-tekst" value={item.alt || ''} onChange={(v) => set({ alt: v })} placeholder="Mida pildil näha on?" />
      </> : null}
      {item.kind === 'text' ? <>
        <Area label="Tekst" rows={3} value={item.text} onChange={(v) => set({ text: v.slice(0, 600) })} hint="*kaldkiri* ja **paks** tärnide vahel" />
        <Num label="Kirja suurus (pt)" value={item.size} min={8} max={60} onChange={(v) => set({ size: Number(v) || 14 })} />
        <label className="ed-check"><input type="checkbox" checked={item.bold} onChange={(e) => set({ bold: e.target.checked })} /> Paks kiri</label>
        <Select label="Kiri" value={item.font || 'body'} onChange={(v) => set({ font: v })} options={TEXT_FONTS.map((k) => [k, TEXT_FONT_LABEL[k]])} />
        <div className="ed-free-layer" role="group" aria-label="Joondus">
          <span className="ed-label">Joondus</span>
          {TEXT_ALIGNS.map((k) => {
            const on = (item.align || (item.shape === 'circle' || item.shape === 'oval' ? 'center' : 'left')) === k;
            return <button key={k} type="button" className="ed-btn" aria-pressed={on} onClick={() => set({ align: k })}>{TEXT_ALIGN_LABEL[k]}</button>;
          })}
        </div>
        <Select label="Teksti värv" value={item.color || 'auto'} onChange={(v) => set({ color: v })} options={TEXT_COLORS.map((k) => [k, TEXT_COLOR_LABEL[k]])} />
      </> : null}
      {item.kind === 'line' ? <>
        <Select label="Otsad" value={item.heads} onChange={(v) => set({ heads: v })} options={LINE_HEADS.map((k) => [k, HEADS_LABEL[k]])} />
        <Select label="Värv" value={item.color} onChange={(v) => set({ color: v })} options={LINE_COLORS.map((k) => [k, LINE_COLOR_LABEL[k]])} />
        <Select label="Paksus" value={String(item.stroke)} onChange={(v) => set({ stroke: Number(v) })} options={[...new Set([...LINE_STROKES, item.stroke])].sort((a, b) => a - b).map((w) => [String(w), `${String(w).replace('.', ',')} mm`])} />
        <label className="ed-check"><input type="checkbox" checked={item.dash} onChange={(e) => set({ dash: e.target.checked })} /> Kriipsjoon</label>
      </> : <>
        <Select label="Kuju" value={item.shape} onChange={(v) => guard({ shape: v })} options={(item.kind === 'image' ? IMAGE_SHAPES : FREE_SHAPES).map((k) => [k, SHAPE_LABEL[k]])} />
        {item.shape === 'bubble' && item.kind !== 'image' ? <Select label="Mulli saba" value={item.tail || 'bl'} onChange={(v) => set({ tail: v })} options={TAILS.map((k) => [k, TAIL_LABEL[k]])} /> : null}
        {item.kind !== 'image' ? <Select label="Värv" value={item.fill} onChange={(v) => set({ fill: v })} options={FREE_FILLS.map((k) => [k, FILL_LABEL[k]])} /> : null}
        <Select label="Raam" value={item.border} onChange={(v) => set({ border: v })} options={FREE_BORDERS.map((k) => [k, BORDER_LABEL[k]])} />
      </>}
      {pages > 1 ? <Select label="Leht" value={String(Math.min(item.page, pages - 1))} onChange={(v) => guard({ page: Number(v) })} options={Array.from({ length: pages }, (_, i) => [String(i), `${i + 1}. leht`])} /> : null}
      {item.kind === 'line' ? null : <Select label="Pööra" value={String(item.rotate || 0)} onChange={(v) => guard({ rotate: Number(v) })} options={[...new Set([...TURNS, item.rotate || 0])].sort((a, b) => a - b).map((d) => [String(d), d ? `${d}°` : 'Otse'])} />}
      <div className="ed-free-layer" role="group" aria-label="Lehel">
        <span className="ed-label">Lehel</span>
        {PLACES.map((how) => <button key={how} type="button" className="ed-btn" disabled={locked} onClick={() => guard(placeOnPage(item, how))}>{PLACE_LABEL[how]}</button>)}
      </div>
      <Select label="Läbipaistvus" value={String(item.opacity ?? 1)} onChange={(v) => set({ opacity: Number(v) })} options={[...new Set([...OPACITIES, item.opacity ?? 1])].sort((a, b) => b - a).map((o) => [String(o), o === 1 ? 'Ei ole (100 %)' : `${Math.round(o * 100)} %`])} />
      <label className="ed-check"><input type="checkbox" checked={item.shadow === true} onChange={(e) => set({ shadow: e.target.checked })} /> Vari</label>
      <div className="ed-free-layer" role="group" aria-label="Kiht">
        <span className="ed-label">Kiht</span>
        <button type="button" className="ed-btn" onClick={() => onLayer('top')}>Kõige peale</button>
        <button type="button" className="ed-btn" onClick={() => onLayer('up')}>Üles</button>
        <button type="button" className="ed-btn" onClick={() => onLayer('down')}>Alla</button>
        <button type="button" className="ed-btn" onClick={() => onLayer('bottom')}>Kõige alla</button>
      </div>
      <label className="ed-check"><input type="checkbox" checked={locked} onChange={(e) => set({ locked: e.target.checked })} /> Lukusta (asukoht ja suurus ei muutu)</label>
      <CopyToPage pages={pages} onToPage={onToPage} />
      <div className="ed-free-actions">
        <button type="button" className="ed-btn" onClick={onDuplicate}>Kopeeri</button>
        <button type="button" className="ed-btn" onClick={onClip} title="Kopeeri lõikelauale, et kleepida teisele lehele või teise tunni Õpikusse (Ctrl+C / Ctrl+V)">Lõikelauale</button>
        <button type="button" className="ed-btn ed-danger" onClick={onDelete}>Kustuta</button>
      </div>
    </div>
  );
}

// Several items selected (2026-11-14): line them up with each other, equal gaps, layer, copy, delete, unselect.
export function FreeGroupFields({ items, pages = 1, onAlign, onSpread, onLayer, onDuplicate, onDelete, onClear, onToPage, onClip }) {
  const locked = items.filter((it) => it.locked).length;
  return (
    <div className="ed-free">
      <p className="ed-hint">{items.length} elementi valitud. Lohista üht neist — liiguvad kõik; nooled nihutavad kõiki. Shift / Ctrl + klõps lisab või eemaldab; Shift + lohistus lehel joonistab valikuraami.{locked ? ` Lukustatud (${locked}) jäävad paigale.` : ''}</p>
      <div className="ed-free-layer" role="group" aria-label="Joonda omavahel">
        <span className="ed-label">Joonda omavahel</span>
        {GROUP_ALIGNS.map((how) => <button key={how} type="button" className="ed-btn" onClick={() => onAlign(how)}>{GROUP_ALIGN_LABEL[how]}</button>)}
      </div>
      {items.length >= 3 ? (
        <div className="ed-free-layer" role="group" aria-label="Võrdsed vahed">
          <span className="ed-label">Võrdsed vahed</span>
          <button type="button" className="ed-btn" onClick={() => onSpread('x')}>Rõhtsalt ↔</button>
          <button type="button" className="ed-btn" onClick={() => onSpread('y')}>Püstiselt ↕</button>
        </div>
      ) : null}
      <div className="ed-free-layer" role="group" aria-label="Kiht">
        <span className="ed-label">Kiht</span>
        <button type="button" className="ed-btn" onClick={() => onLayer('top')}>Kõige peale</button>
        <button type="button" className="ed-btn" onClick={() => onLayer('bottom')}>Kõige alla</button>
      </div>
      <CopyToPage pages={pages} onToPage={onToPage} />
      <div className="ed-free-actions">
        <button type="button" className="ed-btn" onClick={onDuplicate}>Kopeeri kõik</button>
        <button type="button" className="ed-btn" onClick={onClip} title="Kopeeri lõikelauale, et kleepida teisele lehele või teise tunni Õpikusse (Ctrl+C / Ctrl+V)">Lõikelauale</button>
        <button type="button" className="ed-btn ed-danger" onClick={onDelete}>Kustuta kõik</button>
        <button type="button" className="ed-btn" onClick={onClear}>Tühista valik</button>
      </div>
    </div>
  );
}

// „Kopeeri lehele”: the same thing at the same place on another page, or on every other page (a page frame, a header)
function CopyToPage({ pages, onToPage }) {
  if (!onToPage || pages < 2) return null;
  return (
    <div className="ed-free-layer" role="group" aria-label="Kopeeri lehele">
      <span className="ed-label">Kopeeri samasse kohta lehele</span>
      {Array.from({ length: pages }, (_, i) => <button key={i} type="button" className="ed-btn" onClick={() => onToPage(i)}>{i + 1}.</button>)}
      <button type="button" className="ed-btn" onClick={() => onToPage('all')}>Kõikidele lehtedele</button>
    </div>
  );
}
