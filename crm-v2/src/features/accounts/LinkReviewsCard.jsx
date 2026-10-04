import { Link2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card } from '../../components/ui/index.js';

const RELATION = { student: 'Õpilane ise', parent: 'Lapsevanem' };

/**
 * „Vajab otsust”: registrations the automatic linking stopped on because a similar card exists (a possible
 * duplicate). Until the administrator decides, the person has no student card and is not in „Õpilased”.
 */
export default function LinkReviewsCard({ reviews = [], service, onChanged }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  if (!reviews.length && !notice) return null;

  const run = async (key, action, message) => {
    setBusy(key); setError(''); setNotice('');
    try { await action(); setNotice(message); await onChanged?.(); }
    catch (caught) { setError(caught.message || 'Otsust ei õnnestunud salvestada.'); }
    finally { setBusy(''); }
  };

  return (
    <Card className="link-reviews">
      <div className="link-reviews__head"><strong>Vajab otsust: võimalik topeltkaart</strong><Badge tone={reviews.length ? 'warning' : 'success'}>{reviews.length}</Badge></div>
      <p className="link-reviews__hint">Need kontod on kinnitatud või ootavad kinnitust, kuid neil pole veel õpilase kaarti, sest CRM leidis sarnase kaardi. Vali, kas see on sama inimene (seo) või uus õpilane (loo uus kaart).</p>
      {notice ? <p className="accounts-notice" role="status">{notice}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {reviews.map((review) => (
        <article key={review.id} className="link-review" aria-label={`Otsus: ${review.displayName}`}>
          <div className="link-review__who">
            <strong>{review.displayName}</strong>
            <span>{review.email}</span>
            <small>{RELATION[review.relationship] || review.relationship}{review.childName ? ` · laps: ${review.childName}` : ''}{review.approvalStatus === 'pending' ? ' · konto ootab kinnitust' : ''}</small>
            <small className="link-review__reason">{review.reasonText}</small>
          </div>
          {review.candidates.length ? <ul className="link-review__candidates">{review.candidates.map((candidate) => (
            <li key={candidate.id}>
              <span><strong>{candidate.name || 'Nimeta kaart'}</strong><small>{[candidate.email, candidate.parentEmail ? `vanem: ${candidate.parentEmail}` : ''].filter(Boolean).join(' · ') || 'e-post puudub'}</small></span>
              <Button variant="secondary" disabled={Boolean(busy)} loading={busy === `${review.id}:${candidate.id}`}
                onClick={() => run(`${review.id}:${candidate.id}`, () => service.linkToStudent({ uid: review.uid, studentId: candidate.id, relationship: review.relationship }), `${review.displayName} on seotud kaardiga „${candidate.name}”.`)}>
                <Link2 size={15} /> Seo selle kaardiga
              </Button>
            </li>
          ))}</ul> : null}
          <div className="link-review__actions">
            <Button disabled={Boolean(busy)} loading={busy === `${review.id}:new`}
              onClick={() => run(`${review.id}:new`, () => service.createCardForReview(review.id), `${review.childName || review.displayName}: loodi uus õpilase kaart.`)}>
              <UserPlus size={15} /> Loo uus kaart
            </Button>
            <Button variant="secondary" disabled={Boolean(busy)} loading={busy === `${review.id}:dismiss`}
              onClick={() => { if (globalThis.confirm?.('Jätta see otsus vahele? Kaarti ei looda ega seota.')) run(`${review.id}:dismiss`, () => service.dismissReview(review.id), 'Otsus jäeti vahele.'); }}>
              <X size={15} /> Jäta vahele
            </Button>
          </div>
        </article>
      ))}
    </Card>
  );
}
