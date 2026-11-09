import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, FilePlus2, Languages, PenLine, Sparkles, Users } from 'lucide-react';
import { AuthContext } from '../../app/AuthContext.jsx';
import { homeworkService } from '../../services/firebase/homework.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { cardsFromErrors, focusTopics, homeworkFromAnalysis, parentNoteFromAnalysis } from './afterLesson.js';
import { lessonSummariesService } from '../../services/firebase/lessonSummaries.js';
import { Badge, Button, Card, EmptyState, Input, Modal, LoadingState } from '../../components/ui/index.js';
import { RECORDING_STATUS, lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { applyErrorReview, errorKey } from './errorReview.js';
import { lessonAnalysis, wordDiff } from './lessonTimeline.js';
import { analysisStatus, useTranscriberStatus } from './transcriberStatus.js';
import { errorsWorksheet } from './errorWorksheet.js';
import LessonMoments from './LessonMoments.jsx';
import ErrorHomework from './ErrorHomework.jsx';
import './lessonRecording.css';

const clock = (ms) => { const s = Math.floor((ms || 0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const dateLabel = (iso) => (iso ? new Date(iso).toLocaleString('et-EE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const STATUS = {
  recording: ['Salvestamisel', 'info'], uploaded: ['Ootab tekstiks tegemist', 'neutral'], transcribing: ['Teen tekstiks…', 'info'],
  done: ['Tekst valmis', 'success'], failed: ['Viga', 'danger'],
};
const SPEAKER = { teacher: 'Õpetaja', student: 'Õpilane' };
// each line knows its language since the transcriber detects it per phrase (older lines have none)
export const LANGUAGE = { et: 'Eesti keel', ru: 'Vene keel', en: 'Inglise keel' };
const IN_LANGUAGE = { et: 'eesti keeles', ru: 'vene keeles', en: 'inglise keeles' };
const wordsIn = (lines) => lines.reduce((n, l) => n + String(l.text).split(/\s+/).filter(Boolean).length, 0);

// how much of what the student said was in the language being learned
export function studentLanguageShare(transcript = [], lang = 'et') {
  const said = transcript.filter((l) => l.speaker === 'student');
  const all = wordsIn(said);
  const inLang = wordsIn(said.filter((l) => l.lang === lang));
  return { all, inLang, share: all ? Math.round((inLang / all) * 100) : 0, known: said.some((l) => l.lang) };
}

// a word the transcriber was unsure of (`line.unsure` = word indexes) is underlined: a guess, not what was surely said
export function LineText({ line }) {
  if (!line.unsure?.length) return line.text;
  const marked = new Set(line.unsure);
  return String(line.text).split(' ').map((word, i) => (
    <Fragment key={i}>{i ? ' ' : ''}{marked.has(i) ? <span className="transcript__unsure" title="Ebakindel sõna: kuula salvestisest üle">{word}</span> : word}</Fragment>
  ));
}

export function Transcript({ recording, newestFirst = false }) {
  const [q, setQ] = useState('');
  const [who, setWho] = useState('all');
  const [lang, setLang] = useState('all');
  const langs = useMemo(() => Object.keys(LANGUAGE).filter((key) => recording.transcript.some((l) => l.lang === key)), [recording.transcript]);
  const lines = useMemo(() => {
    const list = recording.transcript.filter((l) => (who === 'all' || l.speaker === who) && (lang === 'all' || l.lang === lang) && (!q || String(l.text).toLocaleLowerCase('et').includes(q.toLocaleLowerCase('et'))));
    return newestFirst ? [...list].reverse() : list;
  }, [recording.transcript, q, who, lang, newestFirst]);
  const studentWords = wordsIn(recording.transcript.filter((l) => l.speaker === 'student'));
  const learned = recording.language === 'en' ? 'en' : 'et';
  const share = studentLanguageShare(recording.transcript, learned);
  return (
    <div className="transcript">
      <div className="transcript__tools">
        <Input id={`transcript-search-${recording.id || 'x'}`} label="Otsi" value={q} onChange={(e) => setQ(e.target.value)} placeholder="sõna tekstist" />
        <div className="transcript__who" role="group" aria-label="Kes räägib">
          {[['all', 'Kõik'], ['student', 'Õpilane'], ['teacher', 'Õpetaja']].map(([k, l]) => <button type="button" key={k} aria-pressed={who === k} onClick={() => setWho(k)}>{l}</button>)}
        </div>
        {langs.length > 1 ? <div className="transcript__who" role="group" aria-label="Keel">
          {[['all', 'Kõik keeled'], ...langs.map((key) => [key, LANGUAGE[key]])].map(([k, l]) => <button type="button" key={k} aria-pressed={lang === k} onClick={() => setLang(k)}>{l}</button>)}
        </div> : null}
        <span className="transcript__stat">Õpilane ütles {studentWords} sõna{share.known ? `, neist ${IN_LANGUAGE[learned]} ${share.inLang} (${share.share}%)` : ''}</span>
      </div>
      {lines.length ? <ol className="transcript__lines">{lines.map((l, i) => (
        <li key={`${l.startMs}-${i}`} className={`is-${l.speaker}`}><time>{clock(l.startMs)}</time><b>{SPEAKER[l.speaker] || l.speaker}{l.lang && LANGUAGE[l.lang] ? <small className="transcript__lang"> · {l.lang.toUpperCase()}</small> : null}</b><p><LineText line={l} /></p></li>
      ))}</ol> : <EmptyState title="Midagi ei leitud" />}
    </div>
  );
}

function Analysis({ recording }) {
  const a = useMemo(() => lessonAnalysis(recording.transcript), [recording.transcript]);
  const minutes = (ms) => `${Math.round(ms / 60000)} min`;
  return <div className="lesson-analysis">
    <dl className="lesson-analysis__stats">
      <div><dt>Õpilase osa kõnest</dt><dd>{a.studentShare}%</dd></div>
      <div><dt>Õpilane ütles</dt><dd>{a.student.words} sõna · {minutes(a.student.ms)}</dd></div>
      <div><dt>Õpetaja ütles</dt><dd>{a.teacher.words} sõna · {minutes(a.teacher.ms)}</dd></div>
      <div><dt>Õpilase vastuseid</dt><dd>{a.student.turns}</dd></div>
    </dl>
    {a.longestStudentLine ? <p><b>Pikim õpilase lause:</b> „{a.longestStudentLine}”</p> : null}
    {a.studentQuestions.length ? <div><b>Õpilase küsimused:</b><ul>{a.studentQuestions.slice(0, 10).map((q, i) => <li key={i}>{q}</li>)}</ul></div> : null}
  </div>;
}

// The learner's likely errors (TartuNLP's Estonian correction model on the school Mac): what was said, with the
// changed words struck through and the right ones in bold. A model's suggestion, so the teacher checks it.
const Diff = ({ error }) => <span>{wordDiff(error.said, error.corrected).map((w, k) => (
  <Fragment key={k}>{k ? ' ' : ''}{w.type === 'del' ? <s>{w.text}</s> : w.type === 'ins' ? <ins>{w.text}</ins> : w.text}</Fragment>
))}</span>;

// „Pole viga” (owner 2026-11-04): the teacher marks a flag of the model as wrong (with a short reason if he wants);
// it leaves the counts, „Pärast tundi”, the worksheet and the trend, and can be undone below the list
function LearnerErrors({ errors, dismissed = [], onDismiss = null, onRestore = null }) {
  const [asking, setAsking] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  const [failure, setFailure] = useState('');
  const act = async (key, action) => {
    setBusy(key); setFailure('');
    try { await action(); setAsking(''); setReason(''); } catch (err) { setFailure(err?.message || 'Ei õnnestunud.'); } finally { setBusy(''); }
  };
  return <div className="lesson-ai__errors">
    <b>Õpilase vead ({errors.length})</b>
    {errors.length ? <ol>{errors.map((e, i) => {
      const key = errorKey(e);
      return <li key={key || i}><time>{clock(e.startMs)}</time><Diff error={e} />
        <span className="lesson-ai__errors-side">{e.unsure ? <small title="Kõnetuvastus polnud selles lauses kindel">kontrolli salvestisest</small> : null}
          {onDismiss && asking !== key ? <button type="button" className="lesson-ai__notanerror" title="Mudel eksis: see ei ole õpilase viga" onClick={() => { setAsking(key); setReason(''); }}>Pole viga</button> : null}</span>
        {asking === key ? <div className="lesson-ai__dismiss-form">
          <Input id={`dismiss-reason-${key}`} label="Põhjus (valikuline)" value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} placeholder="nt õige vorm, kõnetuvastuse viga" />
          <Button variant="secondary" loading={busy === key} onClick={() => act(key, () => onDismiss(e, reason))}>Kinnita „Pole viga”</Button>
          <Button variant="secondary" onClick={() => setAsking('')}>Loobu</Button>
        </div> : null}
      </li>;
    })}</ol> : <p className="form-hint">Eestikeelsetes lausetes vigu ei leitud.</p>}
    {dismissed.length ? <details className="lesson-ai__dismissed">
      <summary>Märgitud „Pole viga” ({dismissed.length})</summary>
      <ol>{dismissed.map((e) => <li key={e.key} className="is-dismissed"><time>{clock(e.startMs)}</time><Diff error={e} />
        <span className="lesson-ai__errors-side">{onRestore ? <button type="button" className="lesson-ai__notanerror" disabled={busy === e.key} onClick={() => act(e.key, () => onRestore(e))}>Taasta</button> : null}</span>
        <small className="lesson-ai__why">{e.review?.byName || 'Õpetaja'} · {dateLabel(e.review?.at)}{e.review?.reason ? ` · „${e.review.reason}”` : ''}</small>
      </li>)}</ol>
    </details> : null}
    {failure ? <p className="form-error" role="alert">{failure}</p> : null}
  </div>;
}

// „Pärast tundi”: the learner's error topics and two next steps — homework on them, word cards from his corrected
// sentences (owner 2026-10-12). Both are written only when the teacher presses the button.
export function AfterLesson({ analysis, recording, homework = homeworkService, words = studentWordsService, summaries = lessonSummariesService }) {
  // outside the app (tests, previews) there may be no signed-in user: then the buttons are not shown
  const user = useContext(AuthContext)?.user || null;
  const [busy, setBusy] = useState('');
  const [done, setDone] = useState({});
  const [error, setError] = useState('');
  const topics = focusTopics(analysis);
  const plan = homeworkFromAnalysis({ analysis, recording });
  const cards = cardsFromErrors(analysis?.errors);
  // „Kokkuvõte vanemale”: the teacher reads and edits the plain text before it goes to the family's lesson summary
  const [parentText, setParentText] = useState(null);
  const parentDraft = recording?.invitationId ? parentNoteFromAnalysis({ analysis }) : '';
  if (!user || !recording?.studentId || (!plan && !cards.length)) return null;
  const run = (key, action) => async () => {
    setBusy(key); setError('');
    try { const result = await action(); setDone((current) => ({ ...current, [key]: result })); } catch (failure) { setError(failure?.message || 'Ei õnnestunud.'); } finally { setBusy(''); }
  };
  const giveHomework = run('homework', async () => {
    await homework.create({ ...plan, teacherUid: user?.uid || '', teacherName: user?.displayName || '', createdAt: new Date().toISOString() });
    return `Kodutöö antud: „${plan.task}”, tähtaeg ${plan.due}.`;
  });
  const addCards = run('cards', async () => {
    for (const card of cards) await words.add({ studentId: recording.studentId, invitationId: recording.invitationId || '', user, ...card });
    return `${cards.length} parandatud lauset on õpilase sõnakaartidel.`;
  });
  const sendParent = run('parent', async () => {
    await summaries.appendNote({ invitationId: recording.invitationId, studentId: recording.studentId, text: parentText, user, title: recording.title || '' });
    setParentText(null);
    return 'Kokkuvõte on õpilase ja vanema „Tunnid” all.';
  });
  return <div className="lesson-ai__after">
    <b>Pärast tundi</b>
    {topics.length ? <ul className="lesson-ai__topics">{topics.map((t) => <li key={t.key || t.topic}><span>{String(t.topic).split('(')[0].trim()}</span><em>{t.count}×{t.teacher ? ` · ${t.teacher} õpetajalt` : ''}</em></li>)}</ul> : null}
    <div className="lesson-ai__actions">
      {plan ? <Button variant="secondary" loading={busy === 'homework'} disabled={Boolean(done.homework)} onClick={giveHomework}><BookOpen size={15} aria-hidden="true" /> {done.homework ? 'Kodutöö antud' : 'Anna kodutöö teemade järgi'}</Button> : null}
      {parentDraft && parentText === null ? <Button variant="secondary" disabled={Boolean(done.parent)} onClick={() => setParentText(parentDraft)}><Users size={15} aria-hidden="true" /> {done.parent ? 'Kokkuvõte saadetud' : 'Kokkuvõte vanemale'}</Button> : null}
      {cards.length ? <Button variant="secondary" loading={busy === 'cards'} disabled={Boolean(done.cards)} onClick={addCards}><Languages size={15} aria-hidden="true" /> {done.cards ? 'Kaardid lisatud' : `Lisa parandused kaartidele (${cards.length})`}</Button> : null}
    </div>
    {parentText !== null ? <div className="lesson-ai__parent">
      <label className="textarea-field"><span>Kokkuvõte vanemale ja õpilasele (ainult teemad, mitte transkriptsioon)</span>
        <textarea rows="8" maxLength={2000} value={parentText} onChange={(event) => setParentText(event.target.value)} /></label>
      <div className="lesson-ai__actions">
        <Button loading={busy === 'parent'} disabled={!parentText.trim()} onClick={sendParent}>Saada</Button>
        <Button variant="secondary" onClick={() => setParentText(null)}>Loobu</Button>
      </div>
    </div> : null}
    {done.parent ? <p className="form-hint" role="status">{done.parent}</p> : null}
    {done.homework ? <p className="form-hint" role="status">{done.homework}</p> : null}
    {done.cards ? <p className="form-hint" role="status">{done.cards}</p> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
  </div>;
}

const SUMMARY_PARTS = [['meeldis', 'Meeldis / aktiivne', 'is-good'], ['raske', 'Oli raske', 'is-hard'], ['jargmiseks', 'Järgmiseks tunniks', 'is-next']];
// The didactic analysis made on the school Mac with local models (nothing leaves the Mac). Teacher and admins only.
export function LessonAi({ analysis: given, recording = null, reviewService = lessonRecordingsService, onChanged = null, homeworkServices = null }) {
  const navigate = useNavigate();
  const user = useContext(AuthContext)?.user || null;
  // „Pole viga” marks made here are shown at once; the saved ones come with the recording (errorReview.js)
  const [marks, setMarks] = useState({});
  const raw = recording?.analysisRaw || given;
  const analysis = useMemo(() => (Array.isArray(raw?.errors) ? applyErrorReview(raw, { ...(recording?.errorReview || {}), ...marks }) : raw), [raw, recording?.errorReview, marks]);
  if (!analysis || analysis.error || (!analysis.summary && !analysis.errors)) return null;
  const canReview = Boolean(user && recording?.id && reviewService?.dismissError);
  const dismiss = async (error, reason) => {
    const { key, entry } = await reviewService.dismissError({ recording, error, reason, user });
    setMarks((current) => ({ ...current, [key]: entry }));
    onChanged?.();
  };
  const restore = async (error) => {
    const { key, undoneAt } = await reviewService.restoreError({ recording, key: error.key, user });
    setMarks((current) => ({ ...current, [key]: { ...error.review, undoneAt } }));
    onChanged?.();
  };
  const s = analysis.summary;
  // „Tee tööleht vigadest”: the learner's own sentences of this lesson as a draft in the constructor (not saved yet)
  const draft = () => {
    const date = recording?.startedAt ? new Date(recording.startedAt).toLocaleDateString('et-EE', { day: 'numeric', month: 'numeric' }) : '';
    const document = errorsWorksheet({ errors: analysis.errors || [], studentName: recording?.studentName || '', date });
    if (document) navigate('/library/worksheets/new', { state: { document, from: 'lesson-errors' } });
  };
  const usableErrors = (analysis.errors || []).filter((e) => !e.unsure).length;
  return <section className="lesson-ai" aria-label="Tunni analüüs (AI)">
    <header><Sparkles size={15} aria-hidden="true" /><b>AI analüüs</b><small>kohalik mudel kooli arvutis · ainult õpetajale · kontrolli üle</small></header>
    {s?.kokkuvote ? <p>{s.kokkuvote}</p> : null}
    {s ? <div className="lesson-ai__parts">{SUMMARY_PARTS.filter(([k]) => s[k]?.length).map(([k, label, cls]) => (
      <div key={k} className={cls}><b>{label}</b><ul>{s[k].map((t, i) => <li key={i}>{t}</li>)}</ul></div>
    ))}</div> : null}
    <AfterLesson analysis={analysis} recording={recording} />
    {Array.isArray(analysis.errors) ? <LearnerErrors errors={analysis.errors} dismissed={analysis.dismissedErrors || []} onDismiss={canReview ? dismiss : null} onRestore={canReview ? restore : null} /> : null}
    {usableErrors ? <div><Button variant="secondary" onClick={draft}><FilePlus2 size={15} aria-hidden="true" /> Tee tööleht vigadest ({usableErrors})</Button></div> : null}
    {recording && Array.isArray(analysis.errors) && analysis.errors.length ? <ErrorHomework analysis={analysis} recording={recording} services={homeworkServices || undefined} /> : null}
  </section>;
}

const WAITING = {
  recording: 'Tund on veel salvestamisel.',
  uploaded: 'Salvestis on üles laaditud. Tekst ilmub siia, kui kooli arvuti on selle tekstiks teinud (tavaliselt mõne minuti jooksul).',
  transcribing: 'Teen tekstiks… Tekst ilmub siia mõne minuti jooksul.',
  failed: 'Tekstiks tegemine ebaõnnestus.',
};

// The text of one recording as it is now: analysis + transcript when done, otherwise what it waits for.
// „Hetked” (the teacher's marks from the room) and the lesson's audio come first, whatever the text's status.
export function RecordingText({ recording, transcriber = null, reviewService, onChanged = null, moments = [] }) {
  const marks = <LessonMoments recording={recording} moments={moments} errors={Array.isArray(recording.analysis?.errors) ? recording.analysis.errors : []} service={reviewService || lessonRecordingsService} />;
  if (recording.status === RECORDING_STATUS.done) {
    const ai = analysisStatus(recording, transcriber || {});
    return recording.transcript?.length
      ? <><Analysis recording={recording} />{marks}{ai && ai.key !== 'ready' ? <p className={`lesson-ai__status is-${ai.key}`} role="status">{ai.label}</p> : null}<LessonAi analysis={recording.analysis} recording={recording} reviewService={reviewService} onChanged={onChanged} /><Transcript recording={recording} /></>
      : <>{marks}<p className="form-hint">Salvestisest ei leitud kõnet (liiga lühike või vaikne).</p></>;
  }
  return <>{marks}<p className="form-hint">{WAITING[recording.status] || WAITING.uploaded}{recording.error ? ` ${recording.error}` : ''}</p></>;
}

// Teacher/admin: the student's Live Classroom lessons; each opens the lesson analysis (transcript) or its board.
// `inline` (one lesson opened from the student card): the text of each recording is shown right away.
export default function LessonsCard({ rows, studentId, loading, error, onReload, inline = false, transcriberService }) {
  const [open, setOpen] = useState(null);
  const transcriber = useTranscriberStatus(transcriberService ? { service: transcriberService } : {});
  const statuses = rows.map((row) => analysisStatus(row.recording, transcriber));
  // while an analysis is waiting or running the list refreshes itself, so „valmis” appears without a reload
  const pendingAi = statuses.some((st) => st && (st.key === 'waiting' || st.key === 'running'));
  useEffect(() => {
    if (!pendingAi || !onReload) return undefined;
    const timer = globalThis.setInterval(onReload, 30 * 1000);
    return () => globalThis.clearInterval(timer);
  }, [pendingAi, onReload]);
  return (
    <Card>
      <div className="section-heading"><div><span className="eyebrow">Live Classroom · ainult õpetajale</span><h2>Tunnid</h2></div>{onReload ? <Button variant="secondary" onClick={onReload}>Värskenda</Button> : null}</div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {loading ? <LoadingState inline className="form-hint" label="Laen…" /> : rows.length ? (
        <div className="simple-list lesson-rows">{rows.map((row) => {
          const r = row.recording;
          const status = r ? (STATUS[r.status] || STATUS.uploaded) : null;
          return <div key={row.key} className={inline && r ? 'lesson-rows__item is-inline' : undefined}>
            <div><strong>{r ? dateLabel(r.startedAt) : dateLabel(row.at)} · {row.title}</strong><span>{r ? `${r.teacherName || 'Õpetaja'} · salvestatud${r.parts?.length > 1 ? ` (${r.parts.length} osas)` : ''}` : row.pageId ? 'ainult tahvel' : 'salvestamata'}{row.moments?.length ? ` · hetki ${row.moments.length}` : ''}{row.pageTitle ? ` · leht „${row.pageTitle}”` : ''}</span></div>
            {status ? <span className="lesson-rows__badges"><Badge tone={status[1]}>{status[0]}</Badge>{(() => { const ai = analysisStatus(r, transcriber); return ai ? <Badge tone={ai.tone}>{ai.key === 'ready' ? 'AI analüüs' : ai.key === 'running' ? ai.label : ai.key === 'failed' ? 'AI viga' : 'AI ootab'}</Badge> : null; })()}</span> : null}
            <span className="lesson-rows__actions">
              {r && !inline ? <Button variant="secondary" onClick={() => setOpen(r)}><BarChart3 size={15} /> Tunni analüüs</Button> : null}
              {r || row.pageId ? <Link className="button button--secondary" to={`/board/${studentId}${row.pageId ? `?page=${encodeURIComponent(row.pageId)}` : ''}`}><PenLine size={15} /> Tahvel</Link> : null}
            </span>
            {inline && r ? <div className="lesson-rows__text"><RecordingText recording={r} transcriber={transcriber} reviewService={transcriberService} onChanged={onReload} moments={row.moments || []} /></div> : null}
            {!r && row.moments?.length ? <div className="lesson-rows__text"><LessonMoments moments={row.moments} /></div> : null}
          </div>;
        })}</div>
      ) : <EmptyState title="Live Classroomi tunde veel ei ole" description="Tund ilmub siia, kui see on salvestatud või tahvlile on tehtud tunnileht." />}
      {open ? <Modal open title={`Tunni analüüs · ${dateLabel(open.startedAt)} · ${open.title || 'Tund'}`} onClose={() => setOpen(null)} className="modal--transcript">
        {(() => {
          const row = rows.find((item) => item.recording?.id === open.id);
          return <RecordingText recording={row?.recording || open} transcriber={transcriber} reviewService={transcriberService} onChanged={onReload} moments={row?.moments || []} />;
        })()}
      </Modal> : null}
    </Card>
  );
}
