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

describe('LessonAi', () => {
  it('shows the summary and the learner errors with the changed words', async () => {
    const { LessonAi } = await import('./TranscriptView.jsx');
    const analysis = { version: 1, summary: { kokkuvote: 'Hea tund.', meeldis: ['joonistamine'], raske: [], jargmiseks: ['mul on / mul ei ole'] },
      errors: [{ startMs: 61000, said: 'Mul on kaks vend.', corrected: 'Mul on kaks venda.' }] };
    const { container } = render(<LessonAi analysis={analysis} />);
    expect(screen.getByText('Hea tund.')).toBeInTheDocument();
    expect(screen.getByText('joonistamine')).toBeInTheDocument();
    expect(screen.queryByText('Oli raske')).toBeNull();
    expect(container.querySelector('s').textContent).toBe('vend.');
    expect(container.querySelector('ins').textContent).toBe('venda.');
    expect(render(<LessonAi analysis={{ version: 1, error: 'x' }} />).container.innerHTML).toBe('');
  });
});
