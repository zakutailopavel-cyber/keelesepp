import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import FinanceSettingsPage from './FinanceSettingsPage.jsx';

vi.mock('./FinancePage.jsx', () => ({ default: ({ section }) => <div data-testid="finance-panel">{section}</div> }));

describe('FinanceSettingsPage', () => {
  it('opens a settings panel and keeps the month screen link visible', () => {
    window.history.replaceState(null, '', '#email');
    render(<MemoryRouter><FinanceSettingsPage /></MemoryRouter>);
    expect(screen.getByTestId('finance-panel')).toHaveTextContent('ekirjad');
    fireEvent.click(screen.getByRole('button', { name: /Numeratsioon/ }));
    expect(screen.getByTestId('finance-panel')).toHaveTextContent('numeratsioon');
    expect(screen.getByRole('link', { name: /Tagasi kuu arveldusse/ })).toHaveAttribute('href', '/finance');
  });
});
