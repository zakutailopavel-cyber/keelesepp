import { Skeleton, SkeletonRow, SkeletonScreen } from '../../components/ui/index.js';
import { ROLES } from '../../utils/roles.js';

const times = (count, render) => Array.from({ length: count }, (_, index) => render(index));

// The staff home page while its first data loads (DashboardPage, and HomePage while the page's code downloads): the
// greeting, the numbers (as many as the role sees), „Vajab tähelepanu” beside „Täna”, and the „Ülevaated” tiles.
export default function DashboardSkeleton({ roles = [] }) {
  const learning = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.TEACHER);
  const finance = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.FINANCE);
  const kpis = (learning ? 3 : 0) + (finance ? 1 : 0) || 1;
  return <SkeletonScreen className="page-content" label="Koostan töölauda…">
    <Skeleton lines={1} className="skeleton--heading" />
    <SkeletonRow kind="kpis">{times(kpis, (index) => <Skeleton key={index} variant="card" />)}</SkeletonRow>
    <SkeletonRow kind={learning ? 'halves' : 'kpis'}>
      <Skeleton variant="card" className="skeleton--tall" />
      {learning ? <Skeleton variant="card" className="skeleton--tall" /> : null}
    </SkeletonRow>
    <SkeletonRow kind="tiles">{times(learning ? 6 : 2, (index) => <Skeleton key={index} variant="card" className="skeleton--tile" />)}</SkeletonRow>
  </SkeletonScreen>;
}
