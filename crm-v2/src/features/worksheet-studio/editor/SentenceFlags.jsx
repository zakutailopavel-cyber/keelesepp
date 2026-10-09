import { useState } from 'react';
import { Flag } from 'lucide-react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { generatorFlagsService } from '../../../services/firebase/generatorFlags.js';

// „Halb lause”: a sentence of a gaps / word order task marked bad is taken off the sheet and never generated again.
export default function SentenceFlags({ sentences = '', docId = '', blockType = '', onRemove, service = generatorFlagsService }) {
  const { user } = useAuth() || {};
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const lines = String(sentences).split('\n').filter((x) => x.trim());
  if (!lines.length) return null;
  const flag = async (line) => {
    setBusy(line); setError('');
    try { await service.add({ text: line, lessonId: docId, blockType }, user); onRemove(line); }
    catch (err) { setError(err.message || 'Märget ei saanud salvestada.'); }
    finally { setBusy(''); }
  };
  return (
    <details className="ed-flags">
      <summary className="ed-label"><Flag size={13} aria-hidden="true" /> Halb lause? Eemalda ja ära paku enam</summary>
      <ul>{lines.map((line, i) => (
        <li key={`${i}-${line}`}><span>{line}</span><button type="button" className="ed-btn ghost" disabled={Boolean(busy)} onClick={() => flag(line)} aria-label={`Halb lause: ${line}`}>{busy === line ? '…' : 'Halb lause'}</button></li>
      ))}</ul>
      {error ? <p className="ed-hint is-error" role="alert">{error}</p> : null}
    </details>
  );
}
