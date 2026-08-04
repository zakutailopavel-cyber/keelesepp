import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import HomePage from './HomePage.jsx';

describe('HomePage', () => {
  it('sends a student to the dedicated learning dashboard', async () => {
    const user = { uid: 'student-user', displayName: 'Mari', roles: ['student'] };
    render(<AuthContext.Provider value={{ user }}><MemoryRouter initialEntries={['/']}><Routes><Route path="/" element={<HomePage />} /><Route path="/student" element={<p>Õpilase töölaud</p>} /></Routes></MemoryRouter></AuthContext.Provider>);
    expect(await screen.findByText('Õpilase töölaud')).toBeInTheDocument();
  });
});
