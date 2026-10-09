import { useEffect, useMemo, useState } from 'react';
import { Card, EmptyState } from '../../components/ui/index.js';
import { AUTO_SKILLS, autoSkills } from './autoSkills.js';

const clamp = (n) => Math.max(0, Math.min(100, Number(n) || 0));

// „Areng”: skills computed from the learner's worksheets and recorded lessons (autoSkills.js), with the teacher's
// own grades from checked works next to them.
export default function AutoSkillsCard({ student, user, isAdmin = false, homeworkApi, recordingApi }) {
  const [data, setData] = useState({ loading: true, assignments: [], recordings: [] });
  useEffect(() => {
    let alive = true;
    Promise.all([
      Promise.resolve().then(() => homeworkApi?.listWorksheetAssignmentsByStudentIds?.([student.id]) || []).catch(() => []),
      Promise.resolve().then(() => recordingApi?.listForStudent?.({ studentId: student.id, user, isAdmin }) || []).catch(() => []),
    ]).then(([assignments, recordings]) => { if (alive) setData({ loading: false, assignments, recordings }); });
    return () => { alive = false; };
  }, [homeworkApi, isAdmin, recordingApi, student.id, user]);
  const rows = useMemo(() => autoSkills({ assignments: data.assignments, recordings: data.recordings }), [data]);
  const manual = student.skillMap || {};
  const manualOnly = Object.keys(manual).filter((skill) => !rows.some((r) => r.skill === skill)).sort((a, b) => AUTO_SKILLS.indexOf(a) - AUTO_SKILLS.indexOf(b));
  // a skill only the teacher graded so far: her grade is the value
  const all = [...rows, ...manualOnly.map((skill) => ({ skill, pct: Number(manual[skill]) || 0, basis: 'õpetaja hinne', teacherOnly: true }))];
  return (
    <Card className="profile-wide auto-skills">
      <div className="section-heading"><div><span className="eyebrow">Arvutatakse ise töölehtedest ja tundidest</span><h2>Areng</h2></div></div>
      {data.loading ? <p className="form-hint">Arvutan…</p> : all.length ? (
        <div className="auto-skills__list">{all.map(({ skill, pct, basis, teacherOnly }) => (
          <div key={skill} className="auto-skills__row">
            <span className="auto-skills__name">{skill}</span>
            <div className={`auto-skills__bar ${teacherOnly ? 'is-teacher' : ''}`} aria-hidden="true"><i style={{ width: `${clamp(pct)}%` }} />{skill in manual && !teacherOnly ? <em title={`Õpetaja hinne: ${manual[skill]}%`} style={{ left: `${clamp(manual[skill])}%` }} /> : null}</div>
            <strong>{pct}%</strong>
            <small>{basis}{skill in manual && !teacherOnly ? ` · õpetaja: ${manual[skill]}%` : ''}</small>
          </div>
        ))}</div>
      ) : <EmptyState title="Andmeid veel ei ole" description="Areng ilmub siia, kui õpilane on teinud mõne töölehe või kui tund on salvestatud." />}
    </Card>
  );
}
