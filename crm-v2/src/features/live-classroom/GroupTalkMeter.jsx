import { useState } from 'react';
import { AudioLines } from 'lucide-react';
import { useGroupTalkMeter } from './useTalkMeter.js';
import { TALK_TARGET, groupTalkRows, minutes, percent, talkHint } from './talkMeter.js';
import './talkMeter.css';

/**
 * „Kõneaeg” in a group room (teacher only): the students' share of all talk time in the pill, and in the box every
 * student's minutes and share; the student who talked least in the last 10 minutes is marked (amber when it was under
 * half of a fair share). Measured from the sound level of each incoming track — not the language. Nothing is saved;
 * the students never see it. `members` = [{ id: uid, name }], `remotes` = [{ uid, stream }].
 */
export default function GroupTalkMeter({ local = null, remotes = [], members = [], meter }) {
  const measured = useGroupTalkMeter({ local, remotes, enabled: !meter });
  const talk = meter || measured;
  const [open, setOpen] = useState(false);
  if (!local && !remotes.some((item) => item.stream) && !meter && talk.share === null) return null;
  const hint = talkHint(talk);
  const { rows, quietestId, quietLow } = groupTalkRows(talk, members);
  const quietest = rows.find((row) => row.id === quietestId);
  const tone = quietLow && hint !== 'low' ? 'low' : hint;
  const width = talk.share === null ? 0 : Math.round(talk.share * 100);
  const label = talk.share === null ? 'Kõneaeg: keegi pole veel rääkinud' : `Kõneaeg: õpilased räägivad ${percent(talk.share)}${quietest ? `, kõige vähem ${quietest.name}` : ''}`;
  return (
    <span className="tm">
      <button type="button" className={`lr-pill tm-pill tm-pill--${tone}`} aria-expanded={open} aria-label={label}
        title="Kõneaeg: kui suure osa rääkimisest teevad õpilased. Õpilased seda ei näe." onClick={() => setOpen(!open)}>
        <AudioLines size={15} aria-hidden="true" />
        <span className="lr-label">Õpilased</span>
        <b>{percent(talk.share)}</b>
        <span className="tm-bar" aria-hidden="true"><i style={{ width: `${width}%` }} /><s style={{ left: `${TALK_TARGET * 100}%` }} /></span>
        {quietest && quietLow ? <span className="tm-quiet">vähim: {quietest.name}</span> : null}
      </button>
      {open ? <span className="tm-box" role="dialog" aria-label="Kõneaeg">
        <b>Kõneaeg</b>
        <span>{talk.share === null ? 'Keegi pole veel rääkinud.' : `Õpilased räägivad kokku ${percent(talk.share)} rääkimise ajast. Eesmärk: vähemalt ${Math.round(TALK_TARGET * 100)} %.`}</span>
        <span className="tm-rows tm-rows--group">
          <span className="tm-rows__head">Kes</span><span className="tm-rows__head">Kokku</span><span className="tm-rows__head">10 min</span>
          {rows.map((row) => <span key={row.id} className={`tm-row ${row.id === quietestId ? 'is-quiet' : ''}`}>
            <span>{row.name}{row.id === quietestId ? <small> · räägib kõige vähem</small> : null}</span>
            <strong>{minutes(row.sec)}{row.share === null ? '' : ` · ${percent(row.share)}`}</strong>
            <strong>{minutes(row.recentSec)}</strong>
          </span>)}
          <span className="tm-row"><span>Sina</span><strong>{minutes(talk.teacherSec)}</strong><strong>{minutes(talk.recent?.teacherSec)}</strong></span>
        </span>
        {quietest && quietLow ? <span className="tm-hint tm-hint--low">{quietest.name} on viimased 10 minutit vähe rääkinud. Küsi temalt otse või anna paaristöö.</span> : null}
        {hint === 'low' ? <span className="tm-hint tm-hint--low">Viimased 10 minutit räägivad õpilased kokku vähe. Anna neile rohkem sõna.</span> : null}
        <small>Arvestab ainult, kui kaua keegi räägib (heli järgi) — mitte keelt ega sisu. Õpilased seda ei näe, midagi ei salvestata. Kui see vaheleht on peidus, ei mõõdeta.</small>
      </span> : null}
    </span>
  );
}
