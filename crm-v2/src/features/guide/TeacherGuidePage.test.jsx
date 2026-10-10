import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import TeacherGuidePage from './TeacherGuidePage.jsx';
import { GUIDE_SECTIONS, searchGuide, visibleGuide } from './guideContent.js';

const renderAs = (roles) => render(<AuthContext.Provider value={{ user: { uid: 'u', roles } }}><MemoryRouter><TeacherGuidePage /></MemoryRouter></AuthContext.Provider>);

describe('teacher guide', () => {
  it('shows the first steps and every section a teacher may use, without admin and finance items', () => {
    renderAs(['teacher']);
    expect(screen.getByText('Esimesed sammud')).toBeInTheDocument();
    expect(screen.getByText('0/8')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Tund otse: Live Classroom/ })).toBeInTheDocument();
    expect(screen.queryByText('Uued kontod')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /Arved ja raha/ })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Videojuhendid/ })).toBeInTheDocument();
    expect(screen.getByLabelText('Tund kalendrisse')).toHaveAttribute('src', '/guide-videos/kalender.mp4');
    expect(screen.getAllByRole('link', { name: /Vaata videot: Live tund/ })[0]).toHaveAttribute('href', '#video-live-tund');
    fireEvent.click(screen.getAllByRole('button', { name: /Märgi tehtuks/ })[0]);
    expect(screen.getByText('1/8')).toBeInTheDocument();
  });

  it('admins see everything; search finds items in Estonian and Russian', () => {
    const all = visibleGuide(['admin']);
    expect(all.length).toBe(GUIDE_SECTIONS.length);
    expect(searchGuide(all, 'tahvel').flatMap((s) => s.items).some((i) => i.title === 'Tahvel')).toBe(true);
    expect(searchGuide(all, 'двойной клик').flatMap((s) => s.items).length).toBeGreaterThan(0);
    expect(searchGuide(all, 'zzzz').length).toBe(0);
  });
});
