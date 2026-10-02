import { Md, Line } from '../ui.jsx';
import { norm, splitList } from '../schema.js';
import { Area, Num, Rows, Text } from '../../editor/fields.jsx';

const lines = (value) => String(value || '').split('\n').map((x) => x.trim()).filter(Boolean);
const scoreRows = (rows, get, answerKey = 'answer') => (rows || []).map((row, i) => ({
  key: String(i), ok: splitList(row[answerKey]).map(norm).includes(norm(get(String(i)))),
}));

export const wordforms = {
  type: 'wordforms', label: 'Sõnavormid', group: 'Grammatika ja sõnavara', icon: 'Languages', task: true, width: 'half', tone: 'blue',
  create: () => ({ title: 'Moodusta õige sõnavorm.', instruction: 'Kirjuta nõutud vorm.', rows: [{ base: 'koer', prompt: 'omastav', answer: 'koera' }, { base: 'õppima', prompt: 'ma-vorm', answer: 'õpin' }] }),
  View: ({ data, ctx }) => <div className="ws-formrows">{(data.rows || []).map((row, i) => <div className="ws-formrow" key={i}><b>{row.base}</b><span>{row.prompt}</span><Line interactive={ctx.interactive} value={ctx.get(String(i))} onChange={(v) => ctx.set(String(i), v)} state={ctx.state(String(i))} width="100%" label={`Vorm ${i + 1}`} /></div>)}</div>,
  score: (data, get) => scoreRows(data.rows, get),
  example: (data) => data.rows?.[0] ? { 0: splitList(data.rows[0].answer)[0] || '' } : {},
  Editor: ({ data, set }) => <Rows label="Sõnad ja vormid" rows={data.rows || []} onChange={(rows) => set({ rows })} make={() => ({ base: '', prompt: '', answer: '' })} addLabel="Lisa sõna" render={(row, patch) => <><Text label="Algvorm" value={row.base} onChange={(base) => patch({ base })} /><Text label="Nõutud vorm" value={row.prompt} onChange={(prompt) => patch({ prompt })} /><Text label="Õige vastus (variandid komaga)" value={row.answer} onChange={(answer) => patch({ answer })} /></>} />,
};

export const errorfix = {
  type: 'errorfix', label: 'Leia ja paranda viga', group: 'Grammatika ja sõnavara', icon: 'ScanSearch', task: true, width: 'half', tone: 'peach',
  create: () => ({ title: 'Leia ja paranda viga.', instruction: 'Kirjuta lause õigesti.', rows: [{ wrong: 'Ma lähen koolis.', answer: 'Ma lähen kooli.' }, { wrong: 'Ta õppib eesti keel.', answer: 'Ta õpib eesti keelt.' }] }),
  View: ({ data, ctx }) => <ol className="ws-fix">{(data.rows || []).map((row, i) => <li key={i}><span className="ws-fix-prompt">{row.wrong}</span><Line interactive={ctx.interactive} value={ctx.get(String(i))} onChange={(v) => ctx.set(String(i), v)} state={ctx.state(String(i))} width="100%" label={`Parandus ${i + 1}`} /></li>)}</ol>,
  score: (data, get) => scoreRows(data.rows, get),
  example: (data) => data.rows?.[0] ? { 0: data.rows[0].answer } : {},
  Editor: ({ data, set }) => <Rows label="Laused" rows={data.rows || []} onChange={(rows) => set({ rows })} make={() => ({ wrong: '', answer: '' })} addLabel="Lisa lause" render={(row, patch) => <><Text label="Vigane lause" value={row.wrong} onChange={(wrong) => patch({ wrong })} /><Text label="Õige lause" value={row.answer} onChange={(answer) => patch({ answer })} /></>} />,
};

export const dictation = {
  type: 'dictation', label: 'Etteütlus', group: 'Tekst ja heli', icon: 'AudioLines', task: true, width: 'half', tone: 'sky',
  create: () => ({ title: 'Etteütlus.', instruction: 'Kuula õpetajat või helifaili ja kirjuta laused.', sentences: 'Hommikul lähen ma tööle.\nÕhtul loen raamatut.', lines: 6 }),
  View: ({ data, ctx }) => <div className="ws-dictation">{lines(data.sentences).map((_, i) => <Line key={i} interactive={ctx.interactive} value={ctx.get(String(i))} onChange={(v) => ctx.set(String(i), v)} state={ctx.state(String(i))} width="100%" label={`Etteütluse lause ${i + 1}`} />)}</div>,
  score: (data, get) => lines(data.sentences).map((answer, i) => ({ key: String(i), ok: norm(get(String(i))) === norm(answer) })),
  Editor: ({ data, set }) => <><Area label="Õiged laused (õpilane neid ei näe)" rows={6} value={data.sentences} onChange={(sentences) => set({ sentences })} /><Num label="Kirjutamisridu" value={data.lines} max={15} onChange={(value) => set({ lines: value })} /></>,
};

export const translation = {
  type: 'translation', label: 'Tõlge → eesti keel', group: 'Grammatika ja sõnavara', icon: 'Languages', task: true, width: 'half', tone: 'cream',
  create: () => ({ title: 'Tõlgi eesti keelde.', instruction: 'Õpetaja kontrollib vastust.', rows: [{ source: 'Я живу в Таллине.', hint: '' }, { source: 'Сегодня хорошая погода.', hint: '' }] }),
  View: ({ data, ctx }) => <ol className="ws-translation">{(data.rows || []).map((row, i) => <li key={i}><span>{row.source}</span>{row.hint && <small>{row.hint}</small>}<Line interactive={ctx.interactive} value={ctx.get(String(i))} onChange={(v) => ctx.set(String(i), v)} width="100%" label={`Tõlge ${i + 1}`} /></li>)}</ol>,
  answerKeys: (data) => (data.rows || []).map((_, i) => String(i)),
  Editor: ({ data, set }) => <Rows label="Tõlkelaused" rows={data.rows || []} onChange={(rows) => set({ rows })} make={() => ({ source: '', hint: '' })} addLabel="Lisa lause" render={(row, patch) => <><Text label="Lähtetekst" value={row.source} onChange={(source) => patch({ source })} /><Text label="Vihje (valikuline)" value={row.hint} onChange={(hint) => patch({ hint })} /></>} />,
};

function letterGrid(words, size) {
  const n = Math.max(8, Math.min(16, Number(size) || 10));
  const grid = Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => String.fromCharCode(65 + ((x * 7 + y * 11) % 26))));
  splitList(words).slice(0, n).forEach((word, y) => [...word.toLocaleUpperCase('et')].slice(0, n).forEach((ch, x) => { grid[y][x] = ch; }));
  return grid;
}
export const wordsearch = {
  type: 'wordsearch', label: 'Sõnaotsing', group: 'Grammatika ja sõnavara', icon: 'Grid3X3', task: true, width: 'half', tone: 'green',
  create: () => ({ title: 'Leia sõnad.', instruction: 'Leia ruudustikust kõik sõnad.', words: 'kool, õpetaja, tund, hinne, raamat', size: 10 }),
  View: ({ data }) => { const grid = letterGrid(data.words, data.size); return <><div className="ws-lettergrid" style={{ gridTemplateColumns: `repeat(${grid.length}, 1fr)` }}>{grid.flatMap((row, y) => row.map((ch, x) => <span key={`${x}-${y}`}>{ch}</span>))}</div><div className="ws-wordlist">{splitList(data.words).map((word) => <span key={word}>□ {word}</span>)}</div></>; },
  Editor: ({ data, set }) => <><Area label="Peidetud sõnad (komaga)" value={data.words} onChange={(words) => set({ words })} /><Num label="Ruudustiku suurus" value={data.size} min={8} max={16} onChange={(size) => set({ size })} /></>,
};

export const crossword = {
  type: 'crossword', label: 'Ristsõna', group: 'Grammatika ja sõnavara', icon: 'Grid2X2', task: true, width: 'full', tone: 'blue',
  create: () => ({ title: 'Lahenda ristsõna.', instruction: 'Kirjuta vastused vihjete järgi.', rows: [{ clue: 'Koht, kus õpitakse', answer: 'kool' }, { clue: 'Inimene, kes õpetab', answer: 'õpetaja' }] }),
  View: ({ data, ctx }) => <ol className="ws-crossword">{(data.rows || []).map((row, i) => <li key={i}><span>{row.clue}</span><div className="ws-crossword-cells">{[...String(row.answer || '')].map((_, ci) => <Line key={ci} interactive={ctx.interactive} value={String(ctx.get(String(i)) || '')[ci] || ''} onChange={(v) => { const old = [...String(ctx.get(String(i)) || '').padEnd(String(row.answer || '').length, ' ')]; old[ci] = v.slice(-1); ctx.set(String(i), old.join('').trimEnd()); }} state={ctx.state(String(i))} width="8mm" label={`${i + 1}.${ci + 1}`} />)}</div></li>)}</ol>,
  score: (data, get) => scoreRows(data.rows, get),
  Editor: ({ data, set }) => <Rows label="Vihjed ja vastused" rows={data.rows || []} onChange={(rows) => set({ rows })} make={() => ({ clue: '', answer: '' })} addLabel="Lisa sõna" render={(row, patch) => <><Text label="Vihje" value={row.clue} onChange={(clue) => patch({ clue })} /><Text label="Vastus" value={row.answer} onChange={(answer) => patch({ answer })} /></>} />,
};

export const rolecards = {
  type: 'rolecards', label: 'Rollikaardid A/B', group: 'Kõne ja kirjutamine', icon: 'UsersRound', task: true, width: 'full', tone: 'peach',
  create: () => ({ title: 'Rääkige paarilisega.', instruction: 'Lugege oma rolli ja pidage dialoog.', roleA: 'Oled linnakodanik. Kirjelda probleemi ja paku lahendus.', roleB: 'Oled linnavalitsuse töötaja. Küsi täpsustavaid küsimusi.', phrasesA: 'Soovin juhtida tähelepanu…\nTeen ettepaneku…', phrasesB: 'Palun täpsustage…\nMillal see algas?' }),
  View: ({ data }) => <div className="ws-rolecards"><section><b>ROLL A</b><p><Md text={data.roleA} /></p>{lines(data.phrasesA).map((x) => <span key={x}>{x}</span>)}</section><section><b>ROLL B</b><p><Md text={data.roleB} /></p>{lines(data.phrasesB).map((x) => <span key={x}>{x}</span>)}</section></div>,
  Editor: ({ data, set }) => <><Area label="Roll A" value={data.roleA} onChange={(roleA) => set({ roleA })} /><Area label="A väljendid" value={data.phrasesA} onChange={(phrasesA) => set({ phrasesA })} /><Area label="Roll B" value={data.roleB} onChange={(roleB) => set({ roleB })} /><Area label="B väljendid" value={data.phrasesB} onChange={(phrasesB) => set({ phrasesB })} /></>,
};

export const planning = {
  type: 'planning', label: 'Kirjutamise plaan', group: 'Kõne ja kirjutamine', icon: 'PanelsTopLeft', task: true, width: 'full', tone: 'green',
  create: () => ({ title: 'Enne kirjutamist.', instruction: 'Mõtle läbi põhiideed.', prompts: 'Mis on probleem?\nKus see probleem on?\nKeda see mõjutab ja kuidas?\nMilline oleks hea lahendus?', lines: 3 }),
  View: ({ data, ctx }) => <div className="ws-planning">{lines(data.prompts).map((prompt, i) => <label key={i}><b>{prompt}</b><textarea readOnly={!ctx.interactive} tabIndex={ctx.interactive ? 0 : -1} value={ctx.get(String(i)) || ''} onChange={(e) => ctx.set(String(i), e.target.value)} rows={Number(data.lines) || 3} aria-label={prompt} /></label>)}</div>,
  answerKeys: (data) => lines(data.prompts).map((_, i) => String(i)),
  Editor: ({ data, set }) => <><Area label="Planeerimisküsimused" rows={6} value={data.prompts} onChange={(prompts) => set({ prompts })} /><Num label="Ridu vastuse kohta" value={data.lines} max={8} onChange={(value) => set({ lines: value })} /></>,
};

export const phrasebank = {
  type: 'phrasebank', label: 'Kasulikud väljendid', group: 'Kujundus', icon: 'LibraryBig', task: false, width: 'full', tone: 'green',
  create: () => ({ sections: [{ title: 'Probleemi kirjeldamine', text: 'Soovin juhtida tähelepanu sellele, et …\nViimasel ajal on …' }, { title: 'Ettepanek ja palve', text: 'Teen ettepaneku, et …\nPalun kaaluge võimalust …' }] }),
  View: ({ data }) => <div className="ws-phrasebank">{(data.sections || []).map((section, i) => <section key={i}><b>{section.title}</b>{lines(section.text).map((x) => <span key={x}>{x}</span>)}</section>)}</div>,
  Editor: ({ data, set }) => <Rows label="Väljendirühmad" rows={data.sections || []} onChange={(sections) => set({ sections })} make={() => ({ title: '', text: '' })} addLabel="Lisa rühm" render={(row, patch) => <><Text label="Pealkiri" value={row.title} onChange={(title) => patch({ title })} /><Area label="Väljendid" value={row.text} onChange={(text) => patch({ text })} /></>} />,
};

export const guidedletter = {
  type: 'guidedletter', label: 'Suunatud pikk kiri', group: 'Kõne ja kirjutamine', icon: 'FilePenLine', task: true, width: 'full', tone: 'cream',
  create: () => ({ title: 'Kirjuta kiri.', instruction: 'Koosta terviklik ametlik kiri.', opening: 'Lugupeetud linnavalitsuse esindaja', closing: 'Lugupidamisega', minWords: 120, maxWords: 150, lines: 16 }),
  View: ({ data, ctx }) => { const value = ctx.get('text') || ''; const count = String(value).trim() ? String(value).trim().split(/\s+/).length : 0; return <div className="ws-guidedletter"><p>{data.opening}</p><textarea className="ws-ruled" readOnly={!ctx.interactive} tabIndex={ctx.interactive ? 0 : -1} rows={Number(data.lines) || 12} value={value} onChange={(e) => ctx.set('text', e.target.value)} aria-label="Kiri" /><p>{data.closing}</p><small>{count} sõna · eesmärk {data.minWords}–{data.maxWords}</small></div>; },
  answerKeys: () => ['text'],
  Editor: ({ data, set }) => <><Text label="Algus" value={data.opening} onChange={(opening) => set({ opening })} /><Text label="Lõpetus" value={data.closing} onChange={(closing) => set({ closing })} /><div className="ed-row"><Num label="Min sõnu" value={data.minWords} max={1000} onChange={(minWords) => set({ minWords })} /><Num label="Max sõnu" value={data.maxWords} max={1000} onChange={(maxWords) => set({ maxWords })} /></div><Num label="Kirjutamisridu" value={data.lines} max={30} onChange={(value) => set({ lines: value })} /></>,
};

export const rubric = {
  type: 'rubric', label: 'Kontrollnimekiri / rubriik', group: 'Kõne ja kirjutamine', icon: 'ListTodo', task: true, width: 'full', tone: 'sky',
  create: () => ({ title: 'Kontrolli oma tööd.', instruction: 'Märgi valmis punktid.', items: 'Kasutasin sobivat algust ja lõpetust.\nKirjeldasin probleemi selgelt.\nPakkusin realistliku lahenduse.\nKontrollisin õigekirja.' }),
  View: ({ data, ctx }) => <div className="ws-rubric">{lines(data.items).map((item, i) => <label key={i}><input type="checkbox" disabled={!ctx.interactive} checked={Boolean(ctx.get(String(i)))} onChange={(e) => ctx.set(String(i), e.target.checked)} /><span>{item}</span></label>)}</div>,
  answerKeys: (data) => lines(data.items).map((_, i) => String(i)),
  Editor: ({ data, set }) => <Area label="Kontrollpunktid" rows={7} value={data.items} onChange={(items) => set({ items })} />,
};

export const advancedBlocks = { wordforms, errorfix, dictation, translation, wordsearch, crossword, rolecards, planning, phrasebank, guidedletter, rubric };
