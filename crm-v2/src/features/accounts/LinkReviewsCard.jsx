import { GitMerge, HeartHandshake, Link2, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui/index.js';
import MergeCardsModal from '../students/MergeCardsModal.jsx';

const RELATION = { student: 'Õpilane ise', parent: 'Lapsevanem' };
// the server made a card already, next to cards that may be the same person (account-bootstrap-core.js, 2026-11-09)
const CREATED = 'possible_existing_card_created';
const cardPath = (id) => `/students/${encodeURIComponent(id)}`;

/**
 * „Vajab otsust”: registrations the automatic linking stopped on because a similar card exists (a possible
 * duplicate). Until the administrator decides, the person has no student card and is not in „Õpilased”.
 */
export default function LinkReviewsCard({ reviews = [], service, onChanged, students }) {
  const [busy, setBusy] = useState('');
  const [merging, setMerging] = useState(null);
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
      <p className="link-reviews__hint">Need kontod on kinnitatud või ootavad kinnitust, kuid neil pole veel õpilase kaarti, sest CRM leidis sarnase kaardi. Vali, kas see on sama inimene (seo) või uus õpilane (loo uus kaart). „Uus kaart on loodud”: õpilane sai kohe alustada, kuid tal võib olla juba kaart — ava mõlemad kaardid ja vajadusel ühendamine.</p>
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
          {review.reason === CREATED ? <ul className="link-review__candidates">
            {review.createdStudentId ? <li><span><strong>Uus kaart: <Link to={cardPath(review.createdStudentId)}>{review.createdStudentName || review.displayName}</Link></strong><small>loodud registreerumisel, õpilane saab kohe alustada</small></span></li> : null}
            {review.candidates.map((candidate) => (
              <li key={candidate.id}>
                <span><strong>Olemasolev kaart: <Link to={cardPath(candidate.id)}>{candidate.name || 'Nimeta kaart'}</Link></strong><small>{candidate.matchText || 'sarnane kaart'}</small></span>
                <Button variant="secondary" disabled={Boolean(busy) || !review.createdStudentId}
                  onClick={() => setMerging({ review, candidate })}>
                  <GitMerge size={15} /> Ava ühendamine
                </Button>
              </li>
            ))}
          </ul> : null}
          {review.reason !== CREATED && review.candidates.length ? <ul className="link-review__candidates">{review.candidates.map((candidate) => (
            <li key={candidate.id}>
              <span><strong>{candidate.name || 'Nimeta kaart'}</strong><small>{[candidate.email, candidate.parentEmail ? `vanem: ${candidate.parentEmail}` : ''].filter(Boolean).join(' · ') || 'e-post puudub'}</small></span>
              <Button variant="secondary" disabled={Boolean(busy)} loading={busy === `${review.id}:${candidate.id}`}
                onClick={() => run(`${review.id}:${candidate.id}`, () => service.linkToStudent({ uid: review.uid, studentId: candidate.id, relationship: review.relationship }), `${review.displayName} on seotud kaardiga „${candidate.name}”.`)}>
                <Link2 size={15} /> Seo selle kaardiga
              </Button>
              {review.reason === 'email_on_child_card' ? <Button variant="secondary" disabled={Boolean(busy)} loading={busy === `${review.id}:${candidate.id}:parent`}
                onClick={() => run(`${review.id}:${candidate.id}:parent`, () => service.linkToStudent({ uid: review.uid, studentId: candidate.id, relationship: 'parent' }), `${review.displayName} on nüüd „${candidate.name}” lapsevanem. Kui ta õpib ka ise, vajuta „Loo uus kaart”.`)}>
                <HeartHandshake size={15} /> Seo lapsevanemana
              </Button> : null}
            </li>
          ))}</ul> : null}
          <div className="link-review__actions">
            {/* a parent review without the child's name cannot make a card (the server refuses): link one of the cards above */}
            {review.reason === CREATED || (review.relationship === 'parent' && !review.childName) ? null : <Button disabled={Boolean(busy)} loading={busy === `${review.id}:new`}
              onClick={() => run(`${review.id}:new`, () => service.createCardForReview(review.id), `${review.childName || review.displayName}: loodi uus õpilase kaart.`)}>
              <UserPlus size={15} /> Loo uus kaart
            </Button>}
            <Button variant="secondary" disabled={Boolean(busy)} loading={busy === `${review.id}:dismiss`}
              onClick={() => { if (globalThis.confirm?.(review.reason === CREATED ? 'Pole sama inimene? Mõlemad kaardid jäävad alles.' : 'Jätta see otsus vahele? Kaarti ei looda ega seota.')) run(`${review.id}:dismiss`, () => service.dismissReview(review.id), 'Otsus jäeti vahele.'); }}>
              <X size={15} /> {review.reason === CREATED ? 'Pole sama inimene' : 'Jäta vahele'}
            </Button>
          </div>
        </article>
      ))}
      {/* the existing card stays by default (it has the lessons); the new card's account, words and works move to it */}
      {merging ? <MergeCardsModal open student={{ id: merging.candidate.id, name: merging.candidate.name }} initialSourceId={merging.review.createdStudentId}
        {...(service?.mergeStudents ? { service } : {})} {...(students ? { students } : {})}
        onClose={() => setMerging(null)}
        onMerged={() => {
          const { review } = merging;
          setMerging(null);
          run(`${review.id}:merged`, () => service.dismissReview(review.id), `Kaardid on liidetud: ${review.createdStudentName || review.displayName} → ${merging.candidate.name}.`);
        }} /> : null}
    </Card>
  );
}
