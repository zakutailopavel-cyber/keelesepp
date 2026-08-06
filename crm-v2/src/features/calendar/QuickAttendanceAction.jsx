import { CalendarCheck2 } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { canQuickCompleteLesson, quickAttendanceLabel } from './quickAttendance.js';

export default function QuickAttendanceAction({ item, saving = false, onComplete }) {
  const canComplete = canQuickCompleteLesson(item);

  if (!canComplete) return null;

  const complete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onComplete(item);
  };

  return (
    <Button
      className="quick-attendance-action"
      variant="secondary"
      loading={saving}
      aria-label={`${quickAttendanceLabel(item)}: ${item.studentName || 'Õpilane'}`}
      onClick={complete}
    >
      <CalendarCheck2 size={16} />
      {quickAttendanceLabel(item)}
    </Button>
  );
}
