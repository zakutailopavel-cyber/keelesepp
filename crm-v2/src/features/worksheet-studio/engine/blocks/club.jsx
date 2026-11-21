/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { Text } from '../../editor/fields.jsx';

// Game sheets for the children's speaking club (owner 2026-11-21: „давай делай талисмана и листы-игры”): a comic strip
// with the club mascot Kriksu, where the children write or say the empty speech bubble, and a board game to print and
// play with a dice and counters. Both work on screen, in the Live Classroom and on paper.

const lines = (value) => String(value || '').split('\n').map((l) => l.trim()).filter(Boolean);

// one panel per line: picture | who speaks | what (empty = the child writes or says it)
export const comicPanels = (data) => lines(data.panels).map((line) => {
  const [pic = '', who = '', ...rest] = line.split('|').map((part) => part.trim());
  return { pic, who, text: rest.join('|').trim() };
});
const picSrc = (pic) => (!pic ? '' : /^(\/|https?:)/.test(pic) ? pic : `/kids-art/${pic}.svg`);

export const comic = {
  type: 'comic', label: 'Koomiks (jutumullid)', group: 'Lastele', icon: 'MessageSquare', task: true, width: 'full', tone: 'white',
  create: () => ({
    title: 'Kriksu lugu.', instruction: 'Loe koomiksit. Mida ütleb Kriksu viimases pildis? Kirjuta jutumulli ja ütle valjusti.',
    panels: 'kriksu-wave | Kriksu | Tere! Mina olen Kriksu.\ngirl | Mia | Tere, Kriksu! Kui vana sa oled?\nkriksu-think | Kriksu |',
  }),
  answerKeys: (data) => comicPanels(data).map((panel, i) => (panel.text ? '' : String(i))).filter(Boolean),
  View: ({ data, ctx }) => {
    const panels = comicPanels(data);
    return (
      <ol className={`ws-comic ws-comic--${Math.min(panels.length, 4)}`}>
        {panels.map((panel, i) => (
          <li key={i} className="ws-comic-panel">
            <span className="ws-comic-num">{i + 1}</span>
            <div className={`ws-comic-bubble${panel.text ? '' : ' is-empty'}`}>
              {panel.who ? <b>{panel.who}:</b> : null}
              {panel.text
                ? <span>{panel.text}</span>
                : <textarea rows={2} readOnly={!ctx.interactive} tabIndex={ctx.interactive ? 0 : -1} value={ctx.get(String(i)) || ''} onChange={(e) => ctx.set(String(i), e.target.value)} aria-label={`${panel.who || 'Jutumull'} ${i + 1}`} placeholder={ctx.interactive ? 'Kirjuta siia …' : ''} />}
            </div>
            {picSrc(panel.pic) ? <img src={picSrc(panel.pic)} alt={panel.who || ''} /> : null}
          </li>
        ))}
      </ol>
    );
  },
  Editor: ({ data, set }) => (
    <>
      <label className="ed-field"><span className="ed-label">Pildid (iga rida: pilt | kes | mida ütleb; tühi tekst = laps kirjutab)</span>
        <textarea className="ed-input" rows={6} value={data.panels} onChange={(e) => set({ panels: e.target.value })} />
      </label>
      <span className="ed-hint">Pilt: kriksu-wave, kriksu-think, kriksu-oops, kriksu-happy, girl, boy, … (public/kids-art).</span>
    </>
  ),
};

// a path of squares from START to FINIŠ in a snake: one square per line; „Kriksu …” squares are the mascot's surprises
export const boardSquares = (data) => lines(data.squares);
const COLS = 5;

export const boardgame = {
  type: 'boardgame', label: 'Lauamäng (täringuga)', group: 'Lastele', icon: 'Dices', task: false, width: 'full', tone: 'white',
  create: () => ({
    title: 'Lauamäng.', instruction: 'Mängige 2–4 kaupa: viska täringut, liigu edasi ja täida ruudu ülesanne eesti keeles. Kui ei oska, jää paigale.',
    squares: 'Ütle oma nimi ja vanus.\nKüsi naabrilt: „Kus sa elad?”\nKriksu leidis palli! Mine 2 ruutu edasi.\nNimeta 3 looma.',
    rules: '',
  }),
  View: ({ data }) => {
    const squares = boardSquares(data);
    const cells = [{ label: 'START', kind: 'start' }, ...squares.map((text, i) => ({ label: text, n: i + 1, kind: /^Kriksu/i.test(text) ? 'mascot' : 'task' })), { label: 'FINIŠ', kind: 'finish' }];
    const rows = [];
    for (let i = 0; i < cells.length; i += COLS) rows.push(cells.slice(i, i + COLS));
    return (
      <div className="ws-board">
        {rows.map((row, r) => (
          <div key={r} className={`ws-board-row${r % 2 ? ' is-back' : ''}`}>
            {row.map((cell, c) => (
              <div key={c} className={`ws-board-cell is-${cell.kind}`}>
                {cell.n ? <span className="ws-board-n">{cell.n}</span> : null}
                {cell.kind === 'mascot' ? <img src="/kids-art/kriksu-happy.svg" alt="" /> : null}
                <span className="ws-board-text">{cell.label}</span>
              </div>
            ))}
          </div>
        ))}
        {data.rules ? <p className="ws-board-rules">{data.rules}</p> : null}
      </div>
    );
  },
  Editor: ({ data, set }) => (
    <>
      <label className="ed-field"><span className="ed-label">Ruudud (iga rida üks ruut; „Kriksu …” = üllatusruut)</span>
        <textarea className="ed-input" rows={10} value={data.squares} onChange={(e) => set({ squares: e.target.value })} />
      </label>
      <Text label="Reeglid (valikuline)" value={data.rules || ''} onChange={(rules) => set({ rules })} />
    </>
  ),
};

export const clubBlocks = { comic, boardgame };
