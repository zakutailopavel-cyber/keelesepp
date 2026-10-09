import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Transcript } from './TranscriptView.jsx';

describe('Transcript', () => {
  it('underlines words the transcriber was unsure of and shows the language of each line', () => {
    const recording = { id: 'r1', language: 'et', transcript: [
      { speaker: 'student', startMs: 0, endMs: 2000, text: 'Ma ei saa õega.', lang: 'et', unsure: [2] },
      { speaker: 'student', startMs: 2500, endMs: 3000, text: 'Как сказать?', lang: 'ru' },
    ] };
    const { container } = render(<MemoryRouter><Transcript recording={recording} /></MemoryRouter>);
    const unsure = container.querySelectorAll('.transcript__unsure');
    expect([...unsure].map((el) => el.textContent)).toEqual(['saa']);
    expect(container.querySelector('.transcript__lines p').textContent).toBe('Ma ei saa õega.');
    expect(screen.getByRole('button', { name: 'Vene keel' })).toBeInTheDocument();
    expect(screen.getByText(/neist eesti keeles 4 \(67%\)/)).toBeInTheDocument();
  });
});
