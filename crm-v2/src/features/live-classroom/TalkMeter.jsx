import { useState } from 'react';
import { AudioLines } from 'lucide-react';
import { useTalkMeter } from './useTalkMeter.js';
import { TALK_LOW, TALK_TARGET, minutes, percent, talkHint } from './talkMeter.js';
import './talkMeter.css';

const HINT_TEXT = {
  low: `Viimased 10 minutit räägib õpilane vähe (alla ${Math.round(TALK_LOW * 100)} %). Anna talle rohkem sõna: küsi, oota, lase tal jutustada.`,
  good: 'Õpilane räägib piisavalt. Tubli!',
};

/**
 * „Kõneaeg” in the teacher's top bar (1:1 room only): the student's share of the talk time with a bar and a target
 * line at 60 %; amber when the student talked little in the last 10 minutes. Measured from the sound level of the two
 * microphones — not the language or the words. The student never sees it; nothing is saved.
 */
export default function TalkMeter({ streams, meter }) {
  const measured = useTalkMeter({ local: streams?.local || null, remote: streams?.remote || null, enabled: !meter });
  const talk = meter || measured;
  const [open, setOpen] = useState(false);
  if (!streams?.local && !streams?.remote && !meter && talk.share === null) return null;
  const hint = talkHint(talk);
  const width = talk.share === null ? 0 : Math.round(talk.share * 100);
  const label = talk.share === null ? 'Kõneaeg: keegi pole veel rääkinud' : `Kõneaeg: õpilane räägib ${percent(talk.share)}`;
  return (
    <span className="tm">
      <button type="button" className={`lr-pill tm-pill tm-pill--${hint}`} aria-expanded={open} aria-label={label}
        title="Kõneaeg: kui suure osa rääkimisest teeb õpilane. Õpilane seda ei näe." onClick={() => setOpen(!open)}>
        <AudioLines size={15} aria-hidden="true" />
        <span className="lr-label">Õpilane</span>
        <b>{percent(talk.share)}</b>
        <span className="tm-bar" aria-hidden="true"><i style={{ width: `${width}%` }} /><s style={{ left: `${TALK_TARGET * 100}%` }} /></span>
      </button>
      {open ? <span className="tm-box" role="dialog" aria-label="Kõneaeg">
        <b>Kõneaeg</b>
        <span>{talk.share === null ? 'Keegi pole veel rääkinud.' : `Õpilane räägib ${percent(talk.share)} rääkimise ajast. Eesmärk: vähemalt ${Math.round(TALK_TARGET * 100)} %.`}</span>
        <span className="tm-rows">
          <span>Õpilane</span><strong>{minutes(talk.studentSec)}</strong>
          <span>Sina</span><strong>{minutes(talk.teacherSec)}</strong>
          <span>Viimased 10 min</span><strong>{talk.recent.share === null ? '—' : `õpilane ${percent(talk.recent.share)}`}</strong>
        </span>
        {HINT_TEXT[hint] ? <span className={`tm-hint tm-hint--${hint}`}>{HINT_TEXT[hint]}</span> : null}
        <small>Arvestab ainult, kui kaua kumbki räägib (heli järgi) — mitte keelt ega sisu. Õpilane seda ei näe, midagi ei salvestata. Kui see vaheleht on peidus, ei mõõdeta.</small>
      </span> : null}
    </span>
  );
}
