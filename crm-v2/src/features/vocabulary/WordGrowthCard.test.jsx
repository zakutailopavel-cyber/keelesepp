import { render, screen } from '@testing-library/react';
import WordGrowthCard, { ChildrenWordGrowth } from './WordGrowthCard.jsx';

describe('WordGrowthCard', () => {
  it('shows the numbers and nothing before the first words', () => {
    const { container, rerender } = render(<WordGrowthCard words={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<WordGrowthCard words={[{ word: 'kass', translation: 'кот', box: 3, createdAt: new Date().toISOString() }]} />);
    expect(screen.getByText(/sõna selgeks õpitud/)).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('the family sees each child on his own card', () => {
    const service = { subscribeForStudent: (id, onData) => { onData(id === 'a' ? [{ studentId: 'a', word: 'x', translation: 'y', box: 3 }] : [{ studentId: 'b', word: 'z', translation: 'w', box: 0 }]); return () => {}; } };
    render(<ChildrenWordGrowth students={[{ id: 'a', name: 'Anna' }, { id: 'b', name: 'Boris' }]} service={service} />);
    expect(screen.getByLabelText('Sõnad ja vead: Anna')).toBeInTheDocument();
    expect(screen.getByLabelText('Sõnad ja vead: Boris')).toBeInTheDocument();
  });
});
