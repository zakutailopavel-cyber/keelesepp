import { CheckCircle2, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/index.js';

// The student's answer to a task: a few lines and / or a photo of the notebook (optional), sent with „Tehtud”.
export default function TaskAnswerForm({ busy, onSend, onCancel }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  return <form className="task-answer-form" onSubmit={(event) => { event.preventDefault(); onSend({ text, file }); }}>
    <label className="textarea-field"><span>Vastus (valikuline)</span><textarea rows={3} maxLength={4000} value={text} onChange={(event) => setText(event.target.value)} placeholder="Kirjuta vastus või lisa foto vihikust" /></label>
    <label className="task-answer-file"><Paperclip size={15} /> <input type="file" accept="image/*,application/pdf" onChange={(event) => setFile(event.target.files?.[0] || null)} aria-label="Lisa foto või fail" /></label>
    <div className="task-answer-actions"><Button type="submit" loading={busy}><CheckCircle2 size={16} /> Saada ja märgi tehtuks</Button><Button variant="secondary" disabled={busy} onClick={onCancel}>Loobu</Button></div>
  </form>;
}
