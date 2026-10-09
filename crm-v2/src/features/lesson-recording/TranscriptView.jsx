import { Fragment, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, FilePlus2, PenLine, Sparkles } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Input, Modal } from '../../components/ui/index.js';
import { RECORDING_STATUS } from '../../services/firebase/lessonRecordings.js';
import { lessonAnalysis, wordDiff } from './lessonTimeline.js';
import { analysisStatus, useTranscriberStatus } from './transcriberStatus.js';
import { errorsWorksheet } from './errorWorksheet.js';
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
function LearnerErrors({ errors }) {
  return <div className="lesson-ai__errors">
    <b>Õpilase vead ({errors.length})</b>
    {errors.length ? <ol>{errors.map((e, i) => (
      <li key={i}><time>{clock(e.startMs)}</time><span>{wordDiff(e.said, e.corrected).map((w, k) => (
        <Fragment key={k}>{k ? ' ' : ''}{w.type === 'del' ? <s>{w.text}</s> : w.type === 'ins' ? <ins>{w.text}</ins> : w.text}</Fragment>
      ))}</span>{e.unsure ? <small title="Kõnetuvastus polnud selles lauses kindel">kontrolli salvestisest</small> : null}</li>
    ))}</ol> : <p className="form-hint">Eestikeelsetes lausetes vigu ei leitud.</p>}
  </div>;
}

const SUMMARY_PARTS = [['meeldis', 'Meeldis / aktiivne', 'is-good'], ['raske', 'Oli raske', 'is-hard'], ['jargmiseks', 'Järgmiseks tunniks', 'is-next']];
// The didactic analysis made on the school Mac with local models (nothing leaves the Mac). Teacher and admins only.
export function LessonAi({ analysis, recording = null }) {
  const navigate = useNavigate();
  if (!analysis || analysis.error || (!analysis.summary && !analysis.errors)) return null;
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
    {Array.isArray(analysis.errors) ? <LearnerErrors errors={analysis.errors} /> : null}
    {usableErrors ? <div><Button variant="secondary" onClick={draft}><FilePlus2 size={15} aria-hidden="true" /> Tee tööleht vigadest ({usableErrors})</Button></div> : null}
  </section>;
}

const WAITING = {
  recording: 'Tund on veel salvestamisel.',
  uploaded: 'Salvestis on üles laaditud. Tekst ilmub siia, kui kooli arvuti on selle tekstiks teinud (tavaliselt mõne minuti jooksul).',
  transcribing: 'Teen tekstiks… Tekst ilmub siia mõne minuti jooksul.',
  failed: 'Tekstiks tegemine ebaõnnestus.',
};

// The text of one recording as it is now: analysis + transcript when done, otherwise what it waits for.
export function RecordingText({ recording, transcriber = null }) {
  if (recording.status === RECORDING_STATUS.done) {
    const ai = analysisStatus(recording, transcriber || {});
    return recording.transcript?.length
      ? <><Analysis recording={recording} />{ai && ai.key !== 'ready' ? <p className={`lesson-ai__status is-${ai.key}`} role="status">{ai.label}</p> : null}<LessonAi analysis={recording.analysis} recording={recording} /><Transcript recording={recording} /></>
      : <p className="form-hint">Salvestisest ei leitud kõnet (liiga lühike või vaikne).</p>;
  }
  return <p className="form-hint">{WAITING[recording.status] || WAITING.uploaded}{recording.error ? ` ${recording.error}` : ''}</p>;
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
      {loading ? <p className="form-hint">Laen…</p> : rows.length ? (
        <div className="simple-list lesson-rows">{rows.map((row) => {
          const r = row.recording;
          const status = r ? (STATUS[r.status] || STATUS.uploaded) : null;
          return <div key={row.key} className={inline && r ? 'lesson-rows__item is-inline' : undefined}>
            <div><strong>{r ? dateLabel(r.startedAt) : dateLabel(row.at)} · {row.title}</strong><span>{r ? `${r.teacherName || 'Õpetaja'} · salvestatud${r.parts?.length > 1 ? ` (${r.parts.length} osas)` : ''}` : 'ainult tahvel'}{row.pageTitle ? ` · leht „${row.pageTitle}”` : ''}</span></div>
            {status ? <span className="lesson-rows__badges"><Badge tone={status[1]}>{status[0]}</Badge>{(() => { const ai = analysisStatus(r, transcriber); return ai ? <Badge tone={ai.tone}>{ai.key === 'ready' ? 'AI analüüs' : ai.key === 'running' ? ai.label : ai.key === 'failed' ? 'AI viga' : 'AI ootab'}</Badge> : null; })()}</span> : null}
            <span className="lesson-rows__actions">
              {r && !inline ? <Button variant="secondary" onClick={() => setOpen(r)}><BarChart3 size={15} /> Tunni analüüs</Button> : null}
              <Link className="button button--secondary" to={`/board/${studentId}${row.pageId ? `?page=${encodeURIComponent(row.pageId)}` : ''}`}><PenLine size={15} /> Tahvel</Link>
            </span>
            {inline && r ? <div className="lesson-rows__text"><RecordingText recording={r} transcriber={transcriber} /></div> : null}
          </div>;
        })}</div>
      ) : <EmptyState title="Live Classroomi tunde veel ei ole" description="Tund ilmub siia, kui see on salvestatud või tahvlile on tehtud tunnileht." />}
      {open ? <Modal open title={`Tunni analüüs · ${dateLabel(open.startedAt)} · ${open.title || 'Tund'}`} onClose={() => setOpen(null)} className="modal--transcript">
        <RecordingText recording={rows.find((row) => row.recording?.id === open.id)?.recording || open} transcriber={transcriber} />
      </Modal> : null}
    </Card>
  );
}
