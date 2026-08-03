import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/index.js';

export default function ForbiddenPage() {
  return <main className="standalone-state"><EmptyState title="Ligipääs puudub" description="Sinu rollil ei ole õigust seda CRM-i osa avada." action={<Link className="button button--secondary" to="/">Tagasi avalehele</Link>} /></main>;
}
