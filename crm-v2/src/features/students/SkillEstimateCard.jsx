import { useMemo } from 'react';
import { Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, libraryService, petsService } from '../../services/firebase/index.js';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { groupRecordings } from '../lesson-recording/lessonTimeline.js';
import { coursePosition, estimateLevels, skillEstimate } from './skillEstimate.js';
import './skillEstimate.css';

// reads an admin is already allowed (the same as „Areng”, „Õpilase pilt” and „Minu areng” use); nothing is written
const defaultApi = {
  assignments: (studentId) => homeworkService.listWorksheetAssignmentsByStudentIds([studentId]),
  recordings: (studentId) => lessonRecordingsService.listForStudent({ studentId, user: null, isAdmin: true }),
  stats: (studentId) => petsService.lessonStatsForStudents([studentId]),
  words: (studentId) => studentWordsService.listForStudent(studentId),
  curriculum: () => libraryService.listCurriculum(),
};

const trendText = (n) => (n === null ? '' : n === 0 ? '± 0 p' : `${n > 0 ? '+' : '−'}${Math.abs(n)} p`);

// „Teekond sihttasemeni” (owner 2026-11-04): admin only. An estimate from sheets, recorded lessons and word cards,
// not an exam; never shown to teachers, students or parents. The formula: skillEstimate.js, docs/PROGRESS_ESTIMATE.md.
export default function SkillEstimateCard({ student, lessons = [], repository = defaultApi, now }) {
  const studentId = student?.id;
  const state = useAsyncData(async () => {
    const settle = (fn) => Promise.resolve().then(fn).catch(() => null);
    const [assignments, recordings, stats, words, curriculum] = await Promise.all([
      settle(() => repository.assignments(studentId)), settle(() => repository.recordings(studentId)),
      settle(() => repository.stats(studentId)), settle(() => repository.words(studentId)), settle(() => repository.curriculum?.() || []),
    ]);
    return {
      assignments: assignments || [], recordings: recordings || [], stats: stats || [], words: words || [], curriculum: curriculum || [],
      partial: [assignments, recordings, stats, words].some((item) => item === null),
    };
  }, [repository, studentId]);

  const levels = useMemo(() => estimateLevels(student), [student]);
  const result = useMemo(() => {
    if (!state.data) return null;
    const grouped = groupRecordings(state.data.recordings);
    const estimate = skillEstimate({ level: levels.level, target: levels.target, assignments: state.data.assignments, lessons: grouped, stats: state.data.stats, words: state.data.words, ...(now ? { now } : {}) });
    const course = coursePosition({ curriculum: state.data.curriculum, assignments: state.data.assignments, lessons, step: estimate.step, subject: levels.subject });
    return { estimate, course };
  }, [state.data, levels, lessons, now]);

  if (!studentId) return null;
  return (
    <Card className="profile-wide auto-skills skill-estimate">
      <div className="section-heading"><div><span className="eyebrow">Ainult administraatorile · arvutatakse olemasolevatest andmetest</span><h2>Teekond sihttasemeni</h2></div></div>
      {state.loading && !result ? <p className="form-hint">Arvutan…</p> : null}
      {state.error && !result ? <p className="form-hint">Andmeid ei saanud laadida. <button type="button" className="ls-link" onClick={state.reload}>Proovi uuesti</button></p> : null}
      {result ? <Estimate {...result} levels={levels} partial={state.data.partial} /> : null}
    </Card>
  );
}

function Estimate({ estimate, course, levels, partial }) {
  const { from, to, reached, steps, skills, average, averageTrend, enoughSkills } = estimate;
  return <>
    <p className="skill-estimate__path">
      <strong>{levels.level || '—'}</strong> → <strong>{levels.target || '—'}</strong>
      {!estimate.levelKnown || !estimate.targetKnown ? <span className="skill-estimate__warn"> · {!estimate.levelKnown ? 'tase märkimata' : 'sihttase märkimata'}, arvestan {from} → {to}</span> : null}
      {steps > 1 && !reached ? <span> · {steps} tasemesammu</span> : null}
    </p>
    {reached ? <p className="form-hint">Kaardil märgitud tase on juba sihttasemel või kõrgemal. Pane uus sihttase, et näha teekonda.</p> : null}
    <div className="skill-estimate__summary">
      <div><span>Keskmine</span><strong>{average === null ? 'vähe andmeid' : `${average}%`}</strong><small>{enoughSkills ? `${enoughSkills} oskuse põhjal` : 'ühelgi oskusel pole piisavalt andmeid'}{averageTrend !== null ? ` · 4 nädalaga ${trendText(averageTrend)}` : ''}</small></div>
      <div><span>Kursus</span><strong>{course ? `${course.done} / ${course.total}` : '—'}</strong><small>{course ? `${course.label}: tehtud tunnid (kolm lehte või tund õpetajaga)` : 'kursuse tunde ei leitud'}</small></div>
    </div>
    <div className="auto-skills__list">{skills.map((skill) => (
      <div key={skill.key} className={`auto-skills__row ${skill.enough ? '' : 'is-thin'}`} data-skill={skill.key}>
        <span className="auto-skills__name">{skill.label}</span>
        <div className="auto-skills__bar" aria-hidden="true">{skill.enough ? <i style={{ width: `${skill.pct}%` }} /> : null}</div>
        <strong>{skill.enough ? `${skill.pct}%` : '—'}</strong>
        <small>{skill.enough ? '' : 'vähe andmeid · '}{skill.basis}{skill.trend !== null ? ` · 4 nädalaga ${trendText(skill.trend)}` : ''}</small>
      </div>
    ))}</div>
    <p className="skill-estimate__note"><strong>Hinnang, mitte eksam.</strong> % näitab, kui suur osa teest praegusest tasemest sihttasemeni on oskuses läbitud. Arvutus: viimased töölehed (lugemise, sõnavara ja kuulamise ülesanded), salvestatud tundide analüüs (laused ja kõne) ja sõnakaardid. Õpetaja, õpilane ega lapsevanem seda ei näe.{partial ? ' Osa andmeid jäi laadimata — hinnang võib olla puudulik.' : ''}</p>
  </>;
}
