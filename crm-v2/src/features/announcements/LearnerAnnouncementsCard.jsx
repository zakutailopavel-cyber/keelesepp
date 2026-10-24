import { Megaphone } from 'lucide-react';
import { useState } from 'react';
import { Badge, Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { announcementsService } from '../../services/firebase/announcements.js';
import AnnouncementResponder from './AnnouncementResponder.jsx';
import AnnouncementText from './AnnouncementText.jsx';
import { day } from './announcementModel.js';
import './announcements.css';

// „Teated” on the student's / parent's home: the announcements already answered (and ended ones) to read again.
// Hidden when there is nothing to show or the server cannot be reached.
export default function LearnerAnnouncementsCard({ user, service = announcementsService, availabilityService }) {
  const state = useAsyncData(() => Promise.resolve().then(() => service.mine()).catch(() => ({ pending: [], past: [] })), [service, user?.uid]);
  const [open, setOpen] = useState('');
  const items = [...(state.data?.pending || []), ...(state.data?.past || [])];
  if (state.loading || !items.length) return null;
  return (
    <Card className="learner-announcements">
      <div className="section-heading"><div><span className="eyebrow"><Megaphone size={13} /> Teated · Объявления</span><h2>Teated koolilt</h2></div></div>
      <ul>
        {items.map((item) => {
          const key = `${item.announcement.id}-${item.target.key}`;
          const expanded = open === key;
          return (
            <li key={key} className={expanded ? 'is-open' : ''}>
              <button type="button" className="learner-announcements__row" aria-expanded={expanded} onClick={() => setOpen(expanded ? '' : key)}>
                <span><strong>{item.announcement.title}</strong><small>{day(item.announcement.activeFrom)}{item.target.kind === 'parent' && item.target.studentId ? ` · ${item.target.studentName}` : ''}</small></span>
                {item.response ? <Badge tone="success">Vastatud · Отвечено</Badge> : <Badge tone="neutral">Lõppenud · Завершено</Badge>}
              </button>
              {expanded ? <div className="learner-announcements__body">
                <AnnouncementText body={item.announcement.body} />
                {item.response ? <AnnouncementResponder item={item} user={user} service={service} {...(availabilityService ? { availabilityService } : {})} onAnswered={() => state.reload()} /> : null}
              </div> : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
