import { useMemo } from 'react';
import { Card, LoadingState } from '../../../components/ui/index.js';
import { useAsyncData } from '../../../hooks/useAsyncData.js';
import { homeworkService } from '../../../services/firebase/homework.js';
import { MIN_ANSWERS, calibrate } from '../../worksheet-studio/didactics/calibration.js';

const VERDICT = { hard: ['Liiga raske', 'is-hard'], easy: ['Liiga lihtne', 'is-easy'], ok: ['Sobib', 'is-ok'], few: ['Vähe andmeid', 'is-few'] };

// Step 7 of docs/DIDACTIC_ENGINE.md: how learners actually solve each task type on each level, over all submitted
// worksheets. „Liiga raske / lihtne” (at least MIN_ANSWERS answers) says where the norms or the amounts need tuning.
export default function CalibrationCard({ service = homeworkService }) {
  const data = useAsyncData(() => Promise.resolve().then(() => service.listDoneWorksheetAssignments?.() || []), [service]);
  const rows = useMemo(() => calibrate(data.data || []), [data.data]);
  return (
    <Card className="calibration-card">
      <div className="section-heading"><div><span className="eyebrow">Didaktika kalibreerimine</span><h2>Kuidas õpilased ülesandeid lahendavad</h2></div></div>
      <p className="form-hint">Kõigi esitatud töölehtede põhjal: õigete vastuste osa taseme ja ülesandetüübi kaupa. Hinnang tekib alates {MIN_ANSWERS} vastusest.</p>
      {data.loading ? <LoadingState label="Arvutan…" /> : data.error ? <p className="form-error" role="alert">{data.error.message}</p> : rows.length ? (
        <table className="calibration-table">
          <thead><tr><th>Tase</th><th>Ülesanne</th><th>Õigeid</th><th>Vastuseid</th><th>Lehti</th><th>Hinnang</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={`${r.level}-${r.type}`} className={VERDICT[r.verdict][1]}><td>{r.level}</td><td>{r.label}</td><td>{r.pct}%</td><td>{r.total}</td><td>{r.sheets}</td><td>{VERDICT[r.verdict][0]}</td></tr>
          ))}</tbody>
        </table>
      ) : <p className="form-hint">Esitatud töölehti veel ei ole.</p>}
    </Card>
  );
}
