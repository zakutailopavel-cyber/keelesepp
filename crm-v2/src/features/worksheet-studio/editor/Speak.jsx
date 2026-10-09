/* global File */
import { useState } from 'react';
import { AudioLines, Loader2 } from 'lucide-react';
import { useAssets } from '../engine/assets.jsx';
import { SPEEDS, VOICES, joinWav, speechScript, wavSeconds } from './tts.js';

// „Loo heli”: the block's text is read out by an Estonian voice (TartuNLP Neurokõne) and saved into the sheet like an
// uploaded audio file. Shown only where the host can speak (the CRM constructor); the standalone studio hides it.
// `roles` = the voice pickers this block needs: [['voice', 'Hääl']] or [['voiceA', 'Mari'], ['voiceB', 'Jaan']].
export function SpeakPanel({ type, data, set, roles = [['voice', 'Hääl']] }) {
  const assets = useAssets();
  const [state, setState] = useState({ busy: false, error: '', done: '' });
  if (typeof assets.speak !== 'function') return null;
  const script = speechScript(type, data);
  const speed = Number(data.speed) || 1;
  const make = async () => {
    setState({ busy: true, error: '', done: '' });
    try {
      const pieces = [];
      for (const piece of script) pieces.push(await (await assets.speak({ ...piece, speed })).arrayBuffer());
      const wav = pieces.length === 1 ? pieces[0] : joinWav(pieces, type === 'dialogue' ? 550 : 350);
      const file = new File([wav], `neurokone-${Date.now()}.wav`, { type: 'audio/wav' });
      const audio = await assets.audio(file);
      set({ audio: { ...audio, tts: { speed, voices: Object.fromEntries(roles.map(([key]) => [key, data[key] || (key === 'voiceB' ? 'albert' : 'mari')])) } } });
      setState({ busy: false, error: '', done: `Valmis: ${Math.round(wavSeconds(wav))} s` });
    } catch (error) {
      setState({ busy: false, error: error.message || 'Heli loomine ebaõnnestus.', done: '' });
    }
  };
  return (
    <div className="ed-field ed-speak">
      <span className="ed-label"><AudioLines size={14} aria-hidden="true" /> Loo heli eesti häälega</span>
      <div className="ed-row">
        {roles.map(([key, label]) => (
          <label key={key} className="ed-speak-voice">
            <small>{label}</small>
            <select className="ed-input small" value={data[key] || (key === 'voiceB' ? 'albert' : 'mari')} onChange={(e) => set({ [key]: e.target.value })} aria-label={`${label}: hääl`}>
              {VOICES.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="ed-seg" role="group" aria-label="Kõne kiirus">
        {SPEEDS.map(([value, label]) => <button key={value} type="button" className={speed === value ? 'on' : ''} aria-pressed={speed === value} onClick={() => set({ speed: value })}>{label}</button>)}
      </div>
      <button type="button" className="ed-btn ed-speak-go" disabled={state.busy || !script.length} onClick={make}>
        {state.busy ? <><Loader2 size={14} className="ed-spin" aria-hidden="true" /> Loon heli…</> : data.audio?.src ? 'Loo heli uuesti' : 'Loo heli'}
      </button>
      {!script.length ? <span className="ed-hint">Kirjuta enne tekst, mida ette lugeda.</span> : <span className="ed-hint">Loeb ette {script.length > 1 ? `${script.length} osa` : 'teksti'}; lünkade asemel õige vastus. TartuNLP Neurokõne.</span>}
      {state.done ? <span className="ed-hint is-ok" role="status">{state.done}</span> : null}
      {state.error ? <span className="ed-hint is-error" role="alert">{state.error}</span> : null}
    </div>
  );
}
