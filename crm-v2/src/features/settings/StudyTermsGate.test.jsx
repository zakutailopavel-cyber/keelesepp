import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import ProtectedRoute from '../../app/ProtectedRoute.jsx';
import { ACCESS } from '../../app/accessPolicy.js';

function renderProtected(value) {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/parent']}>
        <Routes>
          <Route element={<ProtectedRoute roles={ACCESS.ALL_AUTHENTICATED} />}>
            <Route path="/parent" element={<div>Parent cabinet</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('parent study terms gate', () => {
  const base = {
    configured: true,
    loading: false,
    error: null,
    preview: null,
    signOut: vi.fn(),
  };

  it('blocks an approved parent until current study terms are accepted', () => {
    renderProtected({
      ...base,
      user: {
        uid: 'parent-1',
        displayName: 'Mari',
        roles: ['parent'],
        approvalStatus: 'approved',
        profile: {},
      },
      acceptStudyTerms: vi.fn(),
    });

    expect(screen.getByRole('heading', { name: 'Õppetingimused' })).toBeInTheDocument();
    expect(screen.queryByText('Parent cabinet')).toBeNull();
  });

  it('accepts the terms through the auth context', async () => {
    const acceptStudyTerms = vi.fn().mockResolvedValue(undefined);
    renderProtected({
      ...base,
      user: {
        uid: 'parent-1',
        displayName: 'Mari',
        roles: ['parent'],
        approvalStatus: 'approved',
        profile: {},
      },
      acceptStudyTerms,
    });

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Kinnitan ja jätkan' }));
    await waitFor(() => expect(acceptStudyTerms).toHaveBeenCalledOnce());
  });

  it('lets a parent with the current version into the cabinet', () => {
    renderProtected({
      ...base,
      user: {
        uid: 'parent-1',
        displayName: 'Mari',
        roles: ['parent'],
        approvalStatus: 'approved',
        profile: {
          studyTermsAcceptedAt: '2026-10-01T18:00:00.000Z',
          studyTermsVersion: '2026-10-01',
        },
      },
      acceptStudyTerms: vi.fn(),
    });

    expect(screen.getByText('Parent cabinet')).toBeInTheDocument();
  });

  it('does not block admin support preview of a parent', () => {
    renderProtected({
      ...base,
      preview: { readOnly: true },
      user: {
        uid: 'parent-1',
        displayName: 'Mari',
        roles: ['parent'],
        approvalStatus: 'approved',
        profile: {},
      },
      acceptStudyTerms: vi.fn(),
    });

    expect(screen.getByText('Parent cabinet')).toBeInTheDocument();
  });
});
