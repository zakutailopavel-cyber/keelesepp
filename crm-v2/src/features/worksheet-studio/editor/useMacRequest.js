/* global setTimeout, clearTimeout */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { aiRequestsService } from '../../../services/firebase/aiRequests.js';

const SLOW_MS = 2 * 60 * 1000;
// One text request to the school Mac (kind „evaluate” or „learnerText”), followed until it is answered.
// → { state: { phase: idle|waiting|done, result, error, slow }, run(text, level) }
export function useMacRequest(kind, service = aiRequestsService) {
  const { user } = useAuth() || {};
  const [state, setState] = useState({ phase: 'idle', result: null, error: '', slow: false });
  const stop = useRef(() => {});
  useEffect(() => () => stop.current(), []);
  const run = async (text, level) => {
    stop.current();
    setState({ phase: 'waiting', result: null, error: '', slow: false });
    try {
      const id = await service.requestText({ kind, text, level }, user);
      const timer = setTimeout(() => setState((s) => (s.phase === 'waiting' ? { ...s, slow: true } : s)), SLOW_MS);
      const unsubscribe = service.subscribe(id, (req) => {
        if (req?.status === 'done') { setState({ phase: 'done', result: req.result, error: '', slow: false }); stop.current(); }
        else if (req?.status === 'failed') { setState({ phase: 'idle', result: null, error: req.error || 'Kooli Mac ei saanud seda teha.', slow: false }); stop.current(); }
      }, (err) => setState({ phase: 'idle', result: null, error: err.message || 'Viga.', slow: false }));
      stop.current = () => { clearTimeout(timer); unsubscribe?.(); stop.current = () => {}; };
    } catch (err) {
      setState({ phase: 'idle', result: null, error: err.message || 'Päringut ei saanud saata.', slow: false });
    }
  };
  return { state, run };
}
