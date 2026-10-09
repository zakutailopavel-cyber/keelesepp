import { CheckCircle2, ClipboardCheck, Clock3, MessageSquare, Star } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Modal, Select } from '../../components/ui/index.js';
import { DocWorksheetSubmissionPreview } from '../worksheet-studio/DocWorksheetPlayer.jsx';
import { VisualWorksheetSubmissionPreview } from './WorksheetPlayer.jsx';
import TextAnnotationEditor from './TextAnnotationEditor.jsx';
import { submissionWritingFields } from './annotations.js';
import { GRADE_LABEL, skillList, suggestedSkills } from './skillGrades.js';
import { formatDate, readableValue } from './submissionFormat.js';
import { describeAutoErrors } from '../worksheet-studio/engine/errorText.js';
import { addLine, feedbackTemplates, suggestedGrade } from './reviewTemplates.js';
import './reviewLayout.css';
import LearnerTextAnalysis, { learnerTexts } from './LearnerTextAnalysis.jsx';

function AnswerList({ answers }) {
  const entries = answers && typeof answers === 'object' ? Object.entries(answers) : [];
  if (!entries.length) return <p className="submission-empty-answer">Vastuseid ei ole salvestatud.</p>;
  return <div className="submission-answers">{entries.map(([key, value], index) => <div key={key}><span>{index + 1}. vastus</span><strong>{readableValue(value)}</strong></div>)}</div>;
}

// A submitted work, checked in one large window: the student's sheet with answers on the left, everything the teacher
// decides on the right — grade, skill grades (they move the student's skill map in „Areng”) and the comment.
// `onSavedNext` (staff queue): „Saada ja järgmine” opens the next work waiting for a review.
export default function SubmissionReviewModal({ submission, staff, repository, user, skillMap = null, onClose, onSaved, onSavedNext }) {
  const [current, setCurrent] = useState(submission);
  // an unreviewed auto-checked work starts with the grade the automatic check suggests
  const autoGrade = submission.reviewStatus === 'reviewed' ? null : suggestedGrade(submission.percentage);
  const [review, setReview] = useState({ teacherGrade: submission.teacherGrade ?? autoGrade ?? '', teacherFeedback: submission.teacherFeedback || '' });
  const worksheetDoc = current.submissionKind === 'worksheet' ? current.source?.worksheetDoc : null;
  const suggested = suggestedSkills(worksheetDoc);
  const skills = skillList(skillMap || {});
  const [grades, setGrades] = useState(() => ({ ...(submission.skillGrades || {}) }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const saveAnnotations = async (annotations) => {
    const saved = await repository.saveSubmissionAnnotations({ submission: current, annotations, user });
    setCurrent((value) => ({ ...value, annotations: saved }));
    return saved;
  };
  const save = async (next = false) => {
    setSaving(true); setError('');
    try {
      const result = await repository.reviewSubmission({ submission: current, ...review, user, ...(skillMap ? { skillGrades: grades } : {}) });
      (next && onSavedNext ? onSavedNext : onSaved)?.(result);
    } catch (saveError) {
      setError(saveError.message || 'Tagasisidet ei saanud salvestada.');
    } finally {
      setSaving(false);
    }
  };
  const ordered = [...suggested, ...skills.filter((skill) => !suggested.includes(skill))];

  return (
    <Modal open title={current.title || 'Esitatud töö'} onClose={onClose} className="modal--review" footer={staff ? <>{error ? <span className="form-error review-error" role="alert">{error}</span> : null}<Button variant="secondary" onClick={onClose}>Sulge</Button>{onSavedNext ? <Button variant="secondary" disabled={saving} onClick={() => save(true)}>Saada ja järgmine</Button> : null}<Button loading={saving} onClick={() => save()}><MessageSquare size={17} /> Saada tagasiside</Button></> : <Button variant="secondary" onClick={onClose}>Sulge</Button>}>
      <div className="review-layout">
        <div className="review-layout__work">
          {worksheetDoc?.blocks?.length
            ? <DocWorksheetSubmissionPreview worksheetDoc={worksheetDoc} answers={current.answers || {}} annotations={current.annotations || []} editable={staff} onAnnotationsChange={saveAnnotations} />
            : <>
              {current.submissionKind === 'worksheet' ? <section><h3>Tööleht vastustega</h3><VisualWorksheetSubmissionPreview files={current.source?.files || []} answers={current.answers || {}} /></section> : null}
              <section><h3>Õpilase vastused</h3><AnswerList answers={current.answers} /></section>
            </>}
          <TextAnnotationEditor fields={submissionWritingFields(current)} annotations={current.annotations || []} editable={staff} onChange={saveAnnotations} />
          {staff ? <LearnerTextAnalysis texts={learnerTexts({ worksheetDoc, answers: current.answers || {}, fields: submissionWritingFields(current) })} level={worksheetDoc?.meta?.level || 'A2'} onFeedback={(lines) => setReview((r) => ({ ...r, teacherFeedback: lines.reduce((text, line) => addLine(text, line), r.teacherFeedback || '') }))} /> : null}
        </div>
        <aside className="review-layout__side">
          <div className="submission-review__hero"><div><span className="eyebrow">{current.submissionKind === 'worksheet' ? 'Tööleht' : 'Interaktiivne harjutus'}</span><strong>{current.studentName}</strong><small>Esitatud {formatDate(current.completedAt)}</small></div><div>{current.percentage != null ? <b>{current.percentage}%</b> : <ClipboardCheck size={28} />}{current.score?.total ? <small>{current.score.correct}/{current.score.total} õiget</small> : null}</div></div>
          {current.selfAssessment ? <section className="submission-self"><strong>Õpilase enesehinnang</strong><p>{current.selfAssessment.difficulty ? `Raskus: ${current.selfAssessment.difficulty}. ` : ''}{current.selfAssessment.comment || 'Kommentaari ei lisatud.'}</p></section> : null}
          {Array.isArray(current.errorLog) && current.errorLog.length ? (
            <section>
              <h3>Automaatselt tuvastatud vead ({current.errorLog.length})</h3>
              {worksheetDoc?.blocks?.length
                ? <ul className="auto-errors">{describeAutoErrors(worksheetDoc, current.errorLog).map((item, index) => <li key={index}><strong>{item.task}{item.where ? ` — ${item.where}` : ''}</strong><span><s>{item.answer || 'vastus puudub'}</s>{item.expected ? <> → <b>{item.expected}</b></> : null}</span></li>)}</ul>
                : <div className="submission-errors">{current.errorLog.map((item, index) => <p key={index}>{readableValue(item)}</p>)}</div>}
            </section>
          ) : null}
          {staff ? (
            <>
              <section className="submission-feedback">
                <h3>Hinne</h3>
                <div className="submission-grade"><Select id="teacher-grade" label="Hinne 1–5" value={review.teacherGrade} onChange={(event) => setReview({ ...review, teacherGrade: event.target.value })}><option value="">Hindeta</option>{[1, 2, 3, 4, 5].map((grade) => <option key={grade} value={grade}>{grade}</option>)}</Select><Star size={21} /></div>
                {autoGrade ? <p className="form-hint">Soovitus automaatkontrolli järgi: {autoGrade} ({current.percentage}%).</p> : null}
              </section>
              {skillMap ? (
                <section className="review-skills" aria-label="Oskuste hinnang">
                  <h3>Oskused</h3>
                  <p className="form-hint">Hinda oskusi, mida see töö näitas. Hinnang muudab õpilase arengukaarti („Areng”); kordushindamine asendab eelmise.</p>
                  {ordered.map((skill) => (
                    <label key={skill} className={`review-skill ${suggested.includes(skill) ? 'is-suggested' : ''}`}>
                      <span>{skill}{skill in (skillMap || {}) ? <small>{skillMap[skill]}%</small> : <small>uus</small>}</span>
                      <select aria-label={`Oskus ${skill}`} value={grades[skill] || ''} onChange={(event) => setGrades((value) => { const next = { ...value }; if (event.target.value) next[skill] = Number(event.target.value); else delete next[skill]; return next; })}>
                        <option value="">ei hinda</option>
                        {[5, 4, 3, 2, 1].map((grade) => <option key={grade} value={grade}>{GRADE_LABEL[grade]}</option>)}
                      </select>
                    </label>
                  ))}
                </section>
              ) : null}
              <label className="textarea-field"><span>Kommentaar õpilasele</span><textarea aria-label="Kommentaar õpilasele" rows="5" value={review.teacherFeedback} onChange={(event) => setReview({ ...review, teacherFeedback: event.target.value })} placeholder="Mis läks hästi ja mida järgmisel korral parandada?" /></label>
              <div className="review-templates" role="group" aria-label="Valmis laused">{feedbackTemplates(current).map((line) => <button type="button" key={line} className="review-template" onClick={() => setReview((value) => ({ ...value, teacherFeedback: addLine(value.teacherFeedback, line) }))}>{line}</button>)}</div>
            </>
          ) : current.reviewStatus === 'reviewed' ? (
            <section className="returned-feedback"><div><MessageSquare size={20} /><strong>Õpetaja tagasiside</strong>{current.teacherGrade ? <Badge tone="success">Hinne {current.teacherGrade}</Badge> : null}</div><p>{current.teacherFeedback || 'Õpetaja jättis tööle hinde ilma kommentaarita.'}</p><small>{current.reviewedByName ? `${current.reviewedByName} · ` : ''}{formatDate(current.reviewedAt)}</small></section>
          ) : <section className="submission-waiting"><Clock3 size={20} /><p>Õpetaja ei ole tööle veel tagasisidet saatnud.</p></section>}
          {current.reviewStatus === 'reviewed' && staff ? <p className="form-hint"><CheckCircle2 size={14} /> Kontrollitud {formatDate(current.reviewedAt)}{current.reviewedByName ? ` · ${current.reviewedByName}` : ''}</p> : null}
        </aside>
      </div>
    </Modal>
  );
}
