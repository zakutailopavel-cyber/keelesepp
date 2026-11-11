// The inspector's fields for a picture's frame and for a picture inside a text (engine/figureFloat.js).
import { Text, ImagePick, Select } from './fields.jsx';
import { BORDER_LABEL, FIGURE_BORDERS, FIGURE_SHAPES, FIGURE_SIDES, FIGURE_WIDTHS, SHAPE_LABEL, SIDE_LABEL, newFigure, shapeAspect } from '../engine/figureFloat.js';
// the frame of a picture: shape and border (the picture block and a picture inside a text)
export function FrameFields({ value, set, locked = false }) {
  return (
    <>
      <Select label="Kuju" value={value.shape || 'rect'} onChange={(v) => !locked && set({ shape: v })} options={FIGURE_SHAPES.map((key) => [key, SHAPE_LABEL[key]])} />
      <Select label="Raam" value={value.border || 'none'} onChange={(v) => set({ border: v })} options={FIGURE_BORDERS.map((key) => [key, BORDER_LABEL[key]])} />
    </>
  );
}

// „Pilt teksti sees”: add, place, size, shape, lock or remove the picture the text wraps around
export function TextFigureFields({ data, set }) {
  const figure = data.figure;
  if (!figure) return <button type="button" className="ed-btn ed-add-figure" onClick={() => set({ figure: newFigure() })}>+ Lisa pilt teksti sisse</button>;
  const patch = (next) => set({ figure: { ...figure, ...next } });
  const paragraphs = Math.max(1, String(data.text || '').split(/\n{2,}/).length);
  return (
    <fieldset className="ed-figure">
      <legend>Pilt teksti sees</legend>
      <ImagePick value={figure.img} aspect={shapeAspect(figure.shape, '4:3')} onChange={(img) => patch({ img })} allowAspect={false} />
      <Text label="Allkiri (valikuline)" value={figure.caption} onChange={(v) => patch({ caption: v })} />
      <Text label="Alt-tekst" value={figure.alt} onChange={(v) => patch({ alt: v })} placeholder="Mida pildil näha on?" />
      <Select label="Asukoht" value={figure.side || 'right'} onChange={(v) => !figure.locked && patch({ side: v })} options={FIGURE_SIDES.map((key) => [key, SIDE_LABEL[key]])} />
      <Select label="Laius" value={String(figure.width || 33)} onChange={(v) => !figure.locked && patch({ width: Number(v) })} options={[...new Set([...FIGURE_WIDTHS, Number(figure.width) || 33])].sort((a, b) => a - b).map((w) => [String(w), `${w} %`])} />
      <Select label="Lõigu juures" value={String(Math.min(Number(figure.at) || 0, paragraphs - 1))} onChange={(v) => !figure.locked && patch({ at: Number(v) })} options={Array.from({ length: paragraphs }, (_, i) => [String(i), `${i + 1}. lõik`])} />
      <FrameFields value={figure} set={patch} locked={figure.locked} />
      <label className="ed-check"><input type="checkbox" checked={figure.locked === true} onChange={(e) => patch({ locked: e.target.checked })} /> Lukusta (asukoht ja suurus ei muutu)</label>
      <button type="button" className="ed-btn" onClick={() => set({ figure: null })}>Eemalda pilt tekstist</button>
    </fieldset>
  );
}

// Non-task blocks: no number badge, no answers. They carry explanation, examples and pictures.

