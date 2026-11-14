// Settings of one item of the free layer (engine/freeLayer.js): what it shows, its shape and colour, its page, size,
// turn, layer, lock; copy and delete. Every change goes through `set(patch)` → one undoable change of `doc.free`.
import { Area, ImagePick, Num, Select, Text } from './fields.jsx';
import { TEXT_ALIGNS, TEXT_ALIGN_LABEL, TEXT_COLORS, TEXT_COLOR_LABEL, TEXT_FONTS, TEXT_FONT_LABEL, FILL_LABEL, FREE_BORDERS, FREE_FILLS, FREE_SHAPES, HEADS_LABEL, KIND_LABEL, LINE_COLORS, LINE_COLOR_LABEL, LINE_HEADS, LINE_STROKES } from '../engine/freeLayer.js';

const SHAPE_LABEL = { rect: 'Ristkülik', rounded: 'Ümarad nurgad', circle: 'Ring', oval: 'Ovaal' };
const BORDER_LABEL = { none: 'Ilma raamita', ink: 'Must joon', lime: 'Laimiroheline joon' };
const TURNS = [-15, -10, -5, -3, 0, 3, 5, 10, 15, 90, -90];

export default function FreeFields({ item, pages = 1, set, onLayer, onDuplicate, onDelete }) {
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
        <Select label="Kuju" value={item.shape} onChange={(v) => guard({ shape: v })} options={FREE_SHAPES.map((k) => [k, SHAPE_LABEL[k]])} />
        {item.kind !== 'image' ? <Select label="Värv" value={item.fill} onChange={(v) => set({ fill: v })} options={FREE_FILLS.map((k) => [k, FILL_LABEL[k]])} /> : null}
        <Select label="Raam" value={item.border} onChange={(v) => set({ border: v })} options={FREE_BORDERS.map((k) => [k, BORDER_LABEL[k]])} />
      </>}
      {pages > 1 ? <Select label="Leht" value={String(Math.min(item.page, pages - 1))} onChange={(v) => guard({ page: Number(v) })} options={Array.from({ length: pages }, (_, i) => [String(i), `${i + 1}. leht`])} /> : null}
      {item.kind === 'line' ? null : <Select label="Pööra" value={String(item.rotate || 0)} onChange={(v) => guard({ rotate: Number(v) })} options={[...new Set([...TURNS, item.rotate || 0])].sort((a, b) => a - b).map((d) => [String(d), d ? `${d}°` : 'Otse'])} />}
      <div className="ed-free-layer" role="group" aria-label="Kiht">
        <span className="ed-label">Kiht</span>
        <button type="button" className="ed-btn" onClick={() => onLayer('top')}>Kõige peale</button>
        <button type="button" className="ed-btn" onClick={() => onLayer('up')}>Üles</button>
        <button type="button" className="ed-btn" onClick={() => onLayer('down')}>Alla</button>
        <button type="button" className="ed-btn" onClick={() => onLayer('bottom')}>Kõige alla</button>
      </div>
      <label className="ed-check"><input type="checkbox" checked={locked} onChange={(e) => set({ locked: e.target.checked })} /> Lukusta (asukoht ja suurus ei muutu)</label>
      <div className="ed-free-actions">
        <button type="button" className="ed-btn" onClick={onDuplicate}>Kopeeri</button>
        <button type="button" className="ed-btn ed-danger" onClick={onDelete}>Kustuta</button>
      </div>
    </div>
  );
}
