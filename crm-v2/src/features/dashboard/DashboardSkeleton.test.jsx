import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DashboardSkeleton from './DashboardSkeleton.jsx';

const kpis = (container) => container.querySelectorAll('.skeleton-row--kpis')[0].children.length;

describe('DashboardSkeleton', () => {
  it('the numbers as the role sees them: admin 4, teacher 3, accountant 1; the label is said once', () => {
    const admin = render(<DashboardSkeleton roles={['admin']} />);
    expect(screen.getByRole('status')).toHaveTextContent('Koostan töölauda…');
    expect(kpis(admin.container)).toBe(4);
    expect(admin.container.querySelector('.skeleton-row--halves')).not.toBeNull();
    admin.unmount();
    expect(kpis(render(<DashboardSkeleton roles={['teacher']} />).container)).toBe(3);
  });

  it('the accountant gets one number and no „Täna” column', () => {
    const { container } = render(<DashboardSkeleton roles={['finance']} />);
    expect(kpis(container)).toBe(1);
    expect(container.querySelector('.skeleton-row--halves')).toBeNull();
  });
});
