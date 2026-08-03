import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loadDashboardData } from '../services/firebaseAdapter.js';

export default function DashboardPage() {
  const [state, setState] = useState({ loading: true, source: 'fallback', data: null });

  useEffect(() => {
    let active = true;
    loadDashboardData().then((result) => {
      if (active) setState({ loading: false, ...result });
    });
    return () => { active = false; };
  }, []);

  if (state.loading || !state.data) {
    return <div className="page-content"><div className="panel">Laen ülevaadet...</div></div>;
  }

  const { metrics, lessons, alerts } = state.data;

  return (
    <div className="page-content">
      <section className="page-heading">
        <div><span className="eyebrow">Esmaspäev, 3. august</span><h1>Tere tulemast tagasi</h1><p>Siin on kooli tänane seis ja järgmised vajalikud tegevused.</p></div>
        <button className="secondary-button">Vaata päevaplaani <ChevronRight size={17} /></button>
      </section>

      {state.source === 'fallback' && <div className="data-notice">Kuvatakse demodata. Firebase adapter on ühendamiseks valmis.</div>}

      <section className="metric-grid">
        {metrics.map((item) => <article className="metric-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.meta}</small></article>)}
      </section>

      <section className="content-grid">
        <article className="panel lessons-panel">
          <div className="panel-header"><div><span className="eyebrow">Täna</span><h2>Järgmised tunnid</h2></div><button className="text-button">Ava kalender</button></div>
          <div className="lesson-list">
            {lessons.map((lesson) => (
              <button className="lesson-row" key={lesson.id}>
                <div className="time-badge">{lesson.time}</div>
                <div className="lesson-main"><strong>{lesson.student}</strong><span>{lesson.subject}</span></div>
                <div className="teacher-name">{lesson.teacher}</div>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        </article>

        <article className="panel attention-panel">
          <div className="panel-header"><div><span className="eyebrow">Tähelepanu</span><h2>Vajab tegutsemist</h2></div></div>
          <div className="alert-list">
            {alerts.map((alert) => <button className={`alert-row ${alert.tone}`} key={alert.id}><span className="alert-dot" /><span>{alert.title}</span><ChevronRight size={17} /></button>)}
          </div>
        </article>
      </section>
    </div>
  );
}
