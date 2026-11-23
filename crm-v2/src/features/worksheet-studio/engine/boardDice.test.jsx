import { render, screen, fireEvent, act } from '@testing-library/react';
import Sheet from './Sheet.jsx';
import { boardThrow } from './blocks/club.jsx';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const doc = { schema: 'keelesepp.worksheet/2', meta: { title: 'Mäng' }, blocks: [{ id: 'b', type: 'boardgame', span: 12, width: 'full', tone: 'white', data: { title: 'Lauamäng', instruction: '', squares: 'Üks\nKaks\nKolm', rules: '' } }] };

describe('board game dice (Live Classroom)', () => {
  it('moves the pawn of whose turn it is, alternates turns and stops at FINIŠ', () => {
    expect(boardThrow({}, 3, 4)).toEqual({ p0: 3, turn: 1, roll: 3 });
    expect(boardThrow({ p0: 3, turn: 1 }, 5, 4)).toEqual({ p1: 4, turn: 0, roll: 5 });
    expect(boardThrow({ p0: 3, turn: 0 }, 6, 4)).toEqual({ p0: 4, turn: 1, roll: 6 });
  });

  it('the learner throws on screen; the answers carry the positions; print shows no dice', () => {
    vi.useFakeTimers();
    const answers = {};
    const setAnswer = vi.fn((k, v) => { answers[k] = v; });
    const { unmount } = render(<Sheet doc={doc} mode="interactive" answers={answers} setAnswer={setAnswer} />);
    fireEvent.click(screen.getByRole('button', { name: /Viska täringut/ }));
    act(() => { vi.advanceTimersByTime(500); });
    expect(answers['b:turn']).toBe(1);
    expect(answers['b:p0']).toBeGreaterThan(0);
    expect(answers['b:roll']).toBeGreaterThanOrEqual(1);
    vi.useRealTimers();
    unmount();
    const teacher = render(<Sheet doc={doc} mode="review" answers={{ 'b:p0': 2, 'b:p1': 1, 'b:turn': 0, 'b:roll': 4 }} />);
    expect(new Set([...teacher.container.querySelectorAll('.ws-pawn')].map((p) => p.title))).toEqual(new Set(['Sina', 'Õpetaja']));
    expect(teacher.queryByRole('button', { name: /Viska täringut/ })).toBeNull();
    teacher.unmount();
    const paper = render(<Sheet doc={doc} mode="print" />);
    expect(paper.container.querySelector('.ws-board-dice')).toBeNull();
  });
});
