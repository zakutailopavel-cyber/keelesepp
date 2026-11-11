 
import { Photo, Md, Bulb, Speech } from '../ui.jsx';
import { splitList } from '../schema.js';
import { altText } from '../image.js';
import { Text, Area, ImagePick, Select, Rows } from '../../editor/fields.jsx';
import FloatFigure from '../FloatFigure.jsx';
import { frameClass, shapeAspect } from '../figureFloat.js';
import { FrameFields, TextFigureFields } from '../../editor/FigureFields.jsx';


export const text = {
  type: 'text', label: 'Tekst / juhis', group: 'Kujundus', icon: 'Type', task: false, width: 'full', tone: 'white',
  create: () => ({ heading: '', text: 'Kirjuta siia selgitus või juhis.' }),
  // `data.figure` (optional): a picture the text wraps around, before paragraph `figure.at` (figureFloat.js)
  View: ({ data, ctx }) => {
    const paragraphs = String(data.text || '').split(/\n{2,}/);
    const at = data.figure ? Math.min(Math.max(0, Number(data.figure.at) || 0), paragraphs.length - 1) : -1;
    const figure = data.figure ? <FloatFigure key="figure" figure={data.figure} onChange={ctx?.patch ? (next) => ctx.patch({ figure: next }) : null} /> : null;
    return (
      <div className={`ws-textblock${figure ? ' has-figure' : ''}`}>
        {data.heading && <h4>{data.heading}</h4>}
        {paragraphs.map((p, i) => [i === at ? figure : null, <p key={i}><Md text={p} /></p>])}
      </div>
    );
  },
  Editor: ({ data, set }) => (
    <>
      <Text label="Pealkiri (valikuline)" value={data.heading} onChange={(v) => set({ heading: v })} />
      <Area label="Tekst" rows={6} value={data.text} onChange={(v) => set({ text: v })} hint="*kaldkiri* tärnide vahel; tühi rida = uus lõik" />
      <TextFigureFields data={data} set={set} />
    </>
  ),
};

export const notice = {
  type: 'notice', label: 'Märka! (näited)', group: 'Kujundus', icon: 'Lightbulb', task: false, width: 'half', tone: 'white',
  create: () => ({ title: 'Märka!', lines: 'Ma ärkan tavaliselt kell 7.\nMa söön lõunat päeval.' }),
  View: ({ data }) => (
    <aside className="ws-notice">
      <b><Bulb />{data.title}</b>
      {String(data.lines || '').split('\n').filter(Boolean).map((l, i) => <div key={i}><Md text={l} /></div>)}
    </aside>
  ),
  Editor: ({ data, set }) => (
    <>
      <Text label="Pealkiri" value={data.title} onChange={(v) => set({ title: v })} />
      <Area label="Näitelaused (iga rida eraldi)" rows={5} value={data.lines} onChange={(v) => set({ lines: v })} />
    </>
  ),
};

export const tip = {
  type: 'tip', label: 'Vihje', group: 'Kujundus', icon: 'MessageCircle', task: false, width: 'half', tone: 'white',
  create: () => ({ title: 'Kasuta erinevaid ajamarkereid:', text: 'hommikul, päeval, õhtul, tavaliselt, enne, pärast.' }),
  View: ({ data }) => (
    <div className="ws-tip"><Speech /><div><b>{data.title}</b><br /><Md text={data.text} /></div></div>
  ),
  Editor: ({ data, set }) => (
    <>
      <Text label="Pealkiri" value={data.title} onChange={(v) => set({ title: v })} />
      <Area label="Tekst" value={data.text} onChange={(v) => set({ text: v })} />
    </>
  ),
};

export const image = {
  type: 'image', label: 'Foto / illustratsioon', group: 'Pildid', icon: 'Image', task: false, width: 'half', tone: 'white',
  create: () => ({ img: null, aspect: '4:3', caption: '', bubble: '' }),
  View: ({ data }) => (
    <figure className={`ws-figure ${frameClass(data)}`}>
      <Photo img={data.img} aspect={shapeAspect(data.shape, data.aspect)} alt={altText(data)}>
        {data.bubble && <div className="ws-bubble">{data.bubble}</div>}
      </Photo>
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  ),
  Editor: ({ data, set }) => (
    <>
      <ImagePick value={data.img} aspect={data.aspect} onChange={(img) => set({ img })} onAspect={(aspect) => set({ aspect })} />
      <Text label="Allkiri (valikuline)" value={data.caption} onChange={(v) => set({ caption: v })} />
      <Text label="Alt-tekst" value={data.alt} onChange={(v) => set({ alt: v })} placeholder={altText({ caption: data.caption }) || 'Mida pildil näha on?'}
        hint="Pildi kirjeldus ekraanilugejale. Tühjana kasutatakse allkirja." />
      <Text label="Jutumull (valikuline)" value={data.bubble} onChange={(v) => set({ bubble: v })} placeholder="Minu päev algab kell …" />
      <FrameFields value={data} set={set} />
    </>
  ),
};

export const vocab = {
  type: 'vocab', label: 'Sõnavara', group: 'Kujundus', icon: 'BookA', task: false, width: 'full', tone: 'cream',
  create: () => ({ title: 'Sõnavara', words: 'hommikul, päeval, õhtul, öösel, tavaliselt, enne, pärast', columns: '4' }),
  View: ({ data }) => (
    <div className="ws-vocab">
      <h4>{data.title}</h4>
      <div className="ws-vocab-cols" style={{ columns: Number(data.columns) || 4 }}>
        {splitList(data.words).map((w, i) => <div key={i}>{w}</div>)}
      </div>
    </div>
  ),
  Editor: ({ data, set }) => (
    <>
      <Text label="Pealkiri" value={data.title} onChange={(v) => set({ title: v })} />
      <Area label="Sõnad (komaga või iga rida eraldi)" rows={5} value={data.words} onChange={(v) => set({ words: v })} />
      <Select label="Veerge" value={data.columns} onChange={(v) => set({ columns: v })} options={[['2', '2'], ['3', '3'], ['4', '4']]} />
    </>
  ),
};

// A mini picture dictionary: 3–5 small square pictures with the word under each (art/wordStrips.js puts it before the
// tasks that use the words). `hidden`: not in the block picker; the sheet builder adds it, a teacher can change or
// delete it.
export const wordstrip = {
  type: 'wordstrip', label: 'Sõnad piltidega', group: 'Pildid', icon: 'Images', task: false, width: 'full', tone: 'white', hidden: true,
  create: () => ({ artFor: 'words', items: [] }),
  View: ({ data }) => (
    <ul className="ws-wordstrip" aria-label="Sõnad piltidega">
      {(data.items || []).map((item) => (
        <li key={item.id || item.word}>
          <Photo img={item.img} aspect="1:1" alt={item.alt || item.word} />
          <span>{item.word}</span>
        </li>
      ))}
    </ul>
  ),
  Editor: ({ data, set }) => (
    <Rows label="Sõnad" rows={data.items || []} onChange={(items) => set({ items })} make={() => ({ word: '', img: null, alt: '' })} addLabel="Lisa sõna" max={5}
      render={(row, patch) => (
        <>
          <ImagePick label="" value={row.img} aspect="1:1" onChange={(img) => patch({ img })} allowAspect={false} />
          <input className="ed-input" placeholder="Sõna" value={row.word} onChange={(e) => patch({ word: e.target.value, alt: e.target.value })} />
        </>
      )} />
  ),
};
