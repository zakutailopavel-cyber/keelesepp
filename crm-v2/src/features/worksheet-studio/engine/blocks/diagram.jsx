import { Area, Select, Text } from '../../editor/fields.jsx';
import { norm } from '../schema.js';
import { DIAGRAM_KINDS, KIND_SAMPLES, MAX_NODES, ZONE_KINDS, diagramAnswers, diagramKind, switchKind } from './diagramModel.js';
import { DiagramView } from './diagramViews.jsx';

// „Skeem”: mind map, chain of steps, cycle, timeline, sentence formula, Venn diagram, T-chart or tree
// (owner, 2026-10-04 and 2026-10-09: schemes in the constructor). Any text written as [answer] (or [answer|other])
// is a gap the learner fills in, also inside a sentence; it is scored like the gap task.

export const diagram = {
  type: 'diagram', label: 'Skeem / diagramm', group: 'Skeemid', icon: 'Network', task: true, width: 'full', tone: 'white',
  create: (kind = 'mind') => ({ kind, ...KIND_SAMPLES[kind] }),
  // one palette entry per kind, so every scheme is one click away
  variants: DIAGRAM_KINDS.map(({ kind, label, hint, icon }) => ({ variant: kind, label, hint, icon })),
  View: ({ data, ctx }) => <DiagramView data={data} ctx={ctx} />,
  answers: (data) => diagramAnswers(data),
  score: (data, get) => diagramAnswers(data).map(({ key, accept }) => ({ key, ok: accept.map(norm).includes(norm(get(key))) })),
  Editor: ({ data, set }) => {
    const kind = diagramKind(data);
    const pairs = kind === 'timeline' || kind === 'formula';
    return (
      <>
        <Select label="Skeemi kuju" value={kind} onChange={(v) => set(switchKind(data, v))} options={DIAGRAM_KINDS.map((k) => [k.kind, `${k.label} — ${k.hint}`])} />
        {ZONE_KINDS.has(kind) ? (
          <>
            <Text label={kind === 'venn' ? 'Vasak ring' : 'Vasak veerg'} value={data.left} onChange={(v) => set({ left: v })} placeholder="Linn" />
            <Area label="Vasakul (iga rida üks sõna või lause)" rows={3} value={data.leftItems} onChange={(v) => set({ leftItems: v })} />
            {kind === 'venn' ? <Area label="Ühine (keskel)" rows={3} value={data.both} onChange={(v) => set({ both: v })} /> : null}
            <Text label={kind === 'venn' ? 'Parem ring' : 'Parem veerg'} value={data.right} onChange={(v) => set({ right: v })} placeholder="Maa" />
            <Area label="Paremal" rows={3} value={data.rightItems} onChange={(v) => set({ rightItems: v })} hint="Lünk nurksulgudes: [pood] — ka lause sees. Kuni 6 rida igas osas." />
          </>
        ) : pairs ? (
          <>
            <Area label={kind === 'timeline' ? 'Ajajoon (iga rida: aeg | sündmus)' : 'Valem (iga rida: küsimus | sõna)'} rows={6} value={data.nodes} onChange={(v) => set({ nodes: v })} hint={kind === 'timeline' ? 'Näide: eile | [käisin] kinos. Kuni 8 rida.' : 'Näide: Kus? | [Tallinnas]. Kuni 8 osa.'} />
            {kind === 'formula' ? <Text label="Näitelause (valikuline)" value={data.note} onChange={(v) => set({ note: v })} placeholder="Mina elan Tallinnas." /> : null}
          </>
        ) : (
          <>
            {kind !== 'flow' ? <Text label={kind === 'tree' ? 'Ülemine kast' : 'Keskmine kast'} value={data.center} onChange={(v) => set({ center: v })} placeholder="Minu päev  või  [lünk]" /> : null}
            <Area label={`Kastid (iga rida üks kast, kuni ${MAX_NODES})`} rows={7} value={data.nodes} onChange={(v) => set({ nodes: v })} hint="Lünk nurksulgudes: [päeval] või [päeval|lõunal] — ka lause sees: [Pesen] hambaid." />
          </>
        )}
      </>
    );
  },
};

