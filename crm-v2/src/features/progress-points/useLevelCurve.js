import { useMemo } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { progressPointsService } from '../../services/firebase/progressPoints.js';
import { toIsoDate } from '../calendar/calendarView.js';
import { levelCurve, loadCourseGoalKeys } from './levelCurve.js';

/**
 * The level curve of one learner: his stored points (progressPoints) + the course goal list of the target level,
 * computed with his worksheetAssignments (which the caller already read — a parent, the student and staff may read
 * them). `loadGoals(level)` is injectable for tests and the demo page.
 */
export function useLevelCurve({ studentIds = [], assignments = [], targetLevel = '', service = progressPointsService, loadGoals = loadCourseGoalKeys, today = toIsoDate() }) {
  const key = studentIds.filter(Boolean).join('|');
  const state = useAsyncData(async () => {
    if (!key) return { points: [], goalKeys: [], level: targetLevel };
    const points = await Promise.resolve().then(() => service.listForStudents(key.split('|'))).catch(() => null);
    const level = targetLevel || (points || []).filter((point) => point.level).at(-1)?.level || '';
    const goalKeys = level ? await Promise.resolve().then(() => loadGoals(level)).catch(() => []) : [];
    return { points: points || [], goalKeys, level, failed: points === null };
  }, [service, key, targetLevel, loadGoals]);
  const curve = useMemo(() => (state.data ? levelCurve({ assignments, goalKeys: state.data.goalKeys, points: state.data.points, level: state.data.level, today }) : null), [assignments, state.data, today]);
  return { curve, level: state.data?.level || targetLevel, points: state.data?.points || [], loading: state.loading && !state.data, failed: Boolean(state.data?.failed), reload: state.reload };
}
