import { useState } from 'react';
import { Copy, Send } from 'lucide-react';
import { Button, Card, Input } from '../../components/ui/index.js';
import { accountApprovalsService } from '../../services/firebase/accountApprovals.js';
import { studentAccess } from '../../services/firebase/students.js';
import ParentInviteDialog from '../parents/ParentInviteDialog.jsx';

const STATUS = {
  student: 'Õpilasel on oma konto.',
  parent: 'Õpilasel pole oma kontot: sisse logitakse lapsevanema kontoga.',
  none: 'Kaardiga pole seotud ühtegi kontot.',
};

// Admin: give the student a login of their own („Saada kutse”: an account without a password + an e-mail with the
// link to set it), or send a new password link to the student's account (owner, 2026-10-14).
export default function StudentAccountCard({ student, service = accountApprovalsService, onInvited, onParentInvited }) {
  const access = studentAccess(student);
  const own = access === 'student';
  const suggested = student.email && student.email !== student.parentEmail ? student.email : '';
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(suggested);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const hasParent = Boolean(student.linkedParentId || student.parentUid || student.guardianUid || (student.linkedParentIds || []).length);

  const send = async (event) => {
    event?.preventDefault();
    setSending(true); setError(''); setResult(null); setCopied(false);
    try {
      const data = await service.inviteStudent({ studentId: student.id, email: own ? '' : email });
      setResult(data); setOpen(false);
      if (data.created) onInvited?.(data);
    } catch (caught) { setError(caught.message || 'Kutset ei saanud saata.'); }
    finally { setSending(false); }
  };
  const copy = async () => {
    try { await globalThis.navigator.clipboard.writeText(result.link); setCopied(true); } catch { setCopied(false); }
  };

  return <Card className="student-account-card">
    <h2>Konto</h2>
    <p>{STATUS[access]}</p>
    {own
      ? <Button variant="secondary" loading={sending} onClick={send}><Send size={16} /> Saada parooli link</Button>
      : open
        ? <form onSubmit={send}>
          <Input label="Õpilase e-post" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="õpilase enda e-post" />
          <p className="form-hint">Õpilane saab kirja lingiga, kus ta määrab parooli. Lapsevanema konto jääb alles.</p>
          <Button type="submit" loading={sending}><Send size={16} /> Saada</Button> <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Loobu</Button>
        </form>
        : <Button onClick={() => setOpen(true)}><Send size={16} /> Saada kutse</Button>}
    {error ? <p className="action-error" role="alert">{error}</p> : null}
    {result ? <div className="success-notice" role="status">
      <span>{result.created ? `Konto loodud: ${result.email}. ` : `Parooli link: ${result.email}. `}
        {result.mailed ? 'Kiri on saadetud.' : 'Kirja ei õnnestunud kinnitada — saada link õpilasele ise.'}</span>
      {result.link ? <Button type="button" variant="secondary" onClick={copy}><Copy size={15} /> {copied ? 'Kopeeritud' : 'Kopeeri link'}</Button> : null}
    </div> : null}
    {/* „Lisa lapsevanem” (owner 2026-10-15): a parent login for this card, prefilled from the card */}
    {hasParent ? <p className="form-hint">Lapsevanema konto on kaardiga seotud.</p>
      : <Button variant="secondary" onClick={() => setParentOpen(true)}><Send size={16} /> Loo lapsevanema konto</Button>}
    {parentOpen ? <ParentInviteDialog open onClose={() => setParentOpen(false)} students={[student]} service={service}
      initial={{ displayName: student.parentName || '', email: student.parentEmail || '', phone: '', studentIds: [student.id] }}
      onDone={(data) => onParentInvited?.(data)} /> : null}
  </Card>;
}
