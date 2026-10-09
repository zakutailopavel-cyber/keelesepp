import { fireEvent, render, screen } from '@testing-library/react';
import UseCases from './UseCases.jsx';

describe('UseCases', () => {
  it('lists EKI use situations of the level and hands a statement to the action', async () => {
    const pick = vi.fn();
    render(<UseCases level="A2" actions={[['Ma oskan…', pick]]} />);
    expect(await screen.findByText(/tase A2/)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Ma oskan…' })[0]);
    expect(pick).toHaveBeenCalledWith(expect.stringMatching(/^(Saan|Oskan|Ma |Suudan|Tean|Kirjutan|Räägin|Loen|Kuulan)/));
  });
});
