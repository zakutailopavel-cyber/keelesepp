import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentsPage from './StudentsPage.jsx';

function renderPage(service) {
  return render(<MemoryRouter><StudentsPage service={service} /></MemoryRouter>);
}

describe('students list states', () => {
  it('shows loading while the service is pending', () => {
    renderPage({ list: () => new Promise(() => {}) });
    expect(screen.getByText('Laen õpilasi…')).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    renderPage({ list: async () => ({ items: [], cursor: null, hasMore: false }) });
    expect(await screen.findByText('Õpilasi ei leitud')).toBeInTheDocument();
  });

  it('shows an error returned by the service', async () => {
    renderPage({ list: async () => { throw new Error('Firestore unavailable'); } });
    expect(await screen.findByText('Firestore unavailable')).toBeInTheDocument();
  });

  it('renders students returned by the service', async () => {
    renderPage({ list: async () => ({ items: [{ id: 's1', name: 'Mari Maas', email: 'mari@example.com', active: true, skillMap: {} }], cursor: null, hasMore: false }) });
    expect(await screen.findAllByText('Mari Maas')).not.toHaveLength(0);
  });
});
