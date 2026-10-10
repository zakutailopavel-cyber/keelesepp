import { fireEvent, render, screen } from '@testing-library/react';
import TextToTasks from './TextToTasks.jsx';
import { autoGapChoice, gapsFromChoice, halvesFrom, sentencesOf, tasksFromText, tokensOf, wordOrderFrom } from './textToTasks.js';

const TEXT = 'Eelmisel laupäeval kolisin sõbraga uude korterisse. Hommikul pakkisin raamatud kastidesse. Kell kümme viisime kastid autosse. Lift ei töötanud, seetõttu pidime trepist minema. Õhtul olid kõik asjad uues kodus.';

describe('text to tasks', () => {
  it('splits sentences and words', () => {
    expect(sentencesOf(TEXT)).toHaveLength(5);
    expect(tokensOf(TEXT)[0]).toMatchObject({ i: 0, s: 0, word: 'Eelmisel', bare: 'Eelmisel' });
  });
  it('makes gaps from the words the teacher clicked, keeping punctuation', () => {
    const tokens = tokensOf(TEXT);
    const pick = [tokens.find((t) => t.bare === 'korterisse').i, tokens.find((t) => t.bare === 'kastid').i];
    const g = gapsFromChoice(TEXT, pick);
    expect(g.sentences.split('\n')).toEqual(['Eelmisel laupäeval kolisin sõbraga uude [korterisse].', 'Kell kümme viisime [kastid] autosse.']);
    expect(g.bank).toBe('kastid, korterisse');
    expect(gapsFromChoice(TEXT, pick, { bank: false }).showBank).toBe('no');
  });
  it('picks gaps automatically, one per sentence, never the first word', () => {
    const auto = autoGapChoice(TEXT);
    const first = new Set(sentencesOf(TEXT).map((_, s) => tokensOf(TEXT).find((t) => t.s === s).i));
    expect(auto.length).toBeGreaterThanOrEqual(4);
    expect(auto.some((i) => first.has(i))).toBe(false);
  });
  it('makes word order, halves and the set the teacher asked for', () => {
    expect(wordOrderFrom(TEXT).sentences.split('\n').length).toBeGreaterThanOrEqual(3);
    expect(halvesFrom(TEXT).pairs[0].left.endsWith('…')).toBe(true);
    expect(tasksFromText(TEXT, ['reading', 'gaps', 'halves']).map(([k]) => k)).toEqual(['reading', 'gaps', 'halves']);
    expect(tasksFromText('', ['reading', 'gaps'])).toEqual([]);
  });
  it('the panel inserts the chosen tasks as blocks', () => {
    const onInsert = vi.fn();
    render(<TextToTasks onInsert={onInsert} />);
    fireEvent.change(screen.getByLabelText('Tekst'), { target: { value: TEXT } });
    fireEvent.click(screen.getByRole('button', { name: 'Õhtul' }));
    fireEvent.click(screen.getByRole('button', { name: /Lisa 3 ülesannet lehele/ }));
    const blocks = onInsert.mock.calls[0][0];
    expect(blocks.map((b) => b.type)).toEqual(['reading', 'gaps', 'wordorder']);
    expect(blocks[1].data.sentences).toContain('[Õhtul]');
  });
});
