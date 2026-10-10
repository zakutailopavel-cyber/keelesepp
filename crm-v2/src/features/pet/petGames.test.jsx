import { fireEvent, render, screen } from '@testing-library/react';
import PetGames from './PetGames.jsx';
import { gameRounds, learnerTopics, sheetItems } from './petGames.js';

const doc = { meta: { title: 'Mitmuse osastav', level: 'A2+' }, blocks: [
  { type: 'gaps', data: { bank: 'koeri, raamatuid', sentences: 'Ma näen [koeri].\nTa loeb [raamatuid] kodus.\nMeil on palju [õpilasi] klassis.' } },
  { type: 'match', data: { pairs: [{ left: 'koer', right: 'koeri' }, { left: 'raamat', right: 'raamatuid' }, { left: 'maja', right: 'maju' }] } },
  { type: 'wordorder', data: { sentences: 'Ma ostan poest õunu.\nLapsed mängivad õues.' } },
  { type: 'truefalse', data: { statements: [{ text: 'Koer on loom.', answer: 'true' }, { text: 'Kass lendab.', answer: 'false' }] } },
  { type: 'errorfix', data: { rows: [{ wrong: 'Ma näen koerad.', answer: 'Ma näen koeri.' }] } },
] };
const seq = () => { let i = 0; return () => ((i += 0.37) % 1); };

describe('pet topic games', () => {
  it('takes the games from the learner worksheets', () => {
    const items = sheetItems(doc);
    expect(items.catch).toHaveLength(3);
    expect(items.catch[0]).toMatchObject({ before: 'Ma näen', after: '.', answer: 'koeri' });
    expect(items.catch[0].options).toContain('raamatuid');
    expect(items.pairs).toHaveLength(3);
    expect(items.order.map((o) => o.sentence)).toContain('Lapsed mängivad õues.');
    expect(items.truth).toHaveLength(4);
  });

  it('lists open topics first and only games with enough material', () => {
    const topics = learnerTopics([
      { id: 'old', status: 'done', assignedAt: '2026-10-09', worksheetDoc: doc, title: 'Vana' },
      { id: 'new', status: 'new', assignedAt: '2026-10-01', worksheetDoc: doc, title: 'Mitmuse osastav' },
      { id: 'empty', status: 'new', assignedAt: '2026-10-10', worksheetDoc: { blocks: [{ type: 'text', data: {} }] } },
    ]);
    expect(topics.map((t) => t.id)).toEqual(['new', 'old']);
    expect(topics[0].games).toEqual(['catch', 'pairs', 'order', 'truth']);
    const rounds = gameRounds(topics[0], 'catch', seq());
    rounds.forEach((r) => { expect(r.options).toHaveLength(3); expect(r.options).toContain(r.answer); });
    expect(gameRounds(topics[0], 'pairs', seq())).toHaveLength(6);
    gameRounds(topics[0], 'order', seq()).forEach((r) => expect(r.mixed.join(' ')).not.toBe(r.words.join(' ')));
  });

  it('plays the quick check and reports the score', async () => {
    const topics = learnerTopics([{ id: 'a', status: 'new', worksheetDoc: doc, title: 'Mitmuse osastav' }]);
    const onDone = vi.fn();
    render(<PetGames topics={topics} kind="siil" onDone={onDone} onClose={() => {}} />);
    expect(screen.getByText('Mitmuse osastav')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Kiire kontroll/ }));
    expect(screen.getByText(/Kas see on õige/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Õige' }));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
