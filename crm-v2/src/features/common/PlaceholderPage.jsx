import { Card, EmptyState, PageHeader } from '../../components/ui/index.js';

export default function PlaceholderPage({ eyebrow, title, description }) {
  return <div className="page-content"><PageHeader eyebrow={eyebrow} title={title} description={description} /><Card><EmptyState title="Moodul valmib migratsiooni järgmises etapis" description="Marsruut ja õiguste piir on valmis. Järgmine PR ühendab selle mooduli olemasolevate KeeleSepp andmete ja töövoogudega." /></Card></div>;
}
