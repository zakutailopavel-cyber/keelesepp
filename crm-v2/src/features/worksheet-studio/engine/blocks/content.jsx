 
import { Photo, Md, Bulb, Speech } from '../ui.jsx';
import { splitList } from '../schema.js';
import { Text, Area, ImagePick, Select } from '../../editor/fields.jsx';

// Non-task blocks: no number badge, no answers. They carry explanation, examples and pictures.

export const text = {
  type: 'text', label: 'Tekst / juhis', group: 'Kujundus', icon: 'Type', task: false, width: 'full', tone: 'white',
  create: () => ({ heading: '', text: 'Kirjuta siia selgitus või juhis.' }),
  View: ({ data }) => (
    <div className="ws-textblock">
      {data.heading && <h4>{data.heading}</h4>}
      {String(data.text || '').split(/\n{2,}/).map((p, i) => <p key={i}><Md text={p} /></p>)}
    </div>
  ),
  Editor: ({ data, set }) => (
    <>
      <Text label="Pealkiri (valikuline)" value={data.heading} onChange={(v) => set({ heading: v })} />
      <Area label="Tekst" rows={6} value={data.text} onChange={(v) => set({ text: v })} hint="*kaldkiri* tärnide vahel; tühi rida = uus lõik" />
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
    <figure className="ws-figure">
      <Photo img={data.img} aspect={data.aspect} alt={data.caption}>
        {data.bubble && <div className="ws-bubble">{data.bubble}</div>}
      </Photo>
      {data.caption && <figcaption>{data.caption}</figcaption>}
    </figure>
  ),
  Editor: ({ data, set }) => (
    <>
      <ImagePick value={data.img} aspect={data.aspect} onChange={(img) => set({ img })} onAspect={(aspect) => set({ aspect })} />
      <Text label="Allkiri (valikuline)" value={data.caption} onChange={(v) => set({ caption: v })} />
      <Text label="Jutumull (valikuline)" value={data.bubble} onChange={(v) => set({ bubble: v })} placeholder="Minu päev algab kell …" />
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
