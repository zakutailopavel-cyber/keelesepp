import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BoardLanguageTools from './BoardLanguageTools.jsx';

globalThis.PointerEvent = globalThis.PointerEvent || class PointerEvent extends globalThis.MouseEvent {};

function Answer() {
  const [value, setValue] = useState('Ma lhen');
  return <><input aria-label="Vastus" value={value} onChange={(event) => setValue(event.target.value)} /><output data-testid="state">{value}</output></>;
}

function Board({ tool = 'fill', staff = false, service, user = { uid: 'u1', displayName: 'Mari' } }) {
  return <div className="sb sb--room">
    <BoardLanguageTools dictionaryFor="s1" user={user} staff={staff} service={service} />
    <div className={`sb-stage tool-${tool} has-worksheet`}>
      <div className="sb-underlay"><p data-testid="text">Kass jookseb aeda</p><Answer /></div>
      <svg />
    </div>
  </div>;
}

const service = (overrides = {}) => ({
  checkOwnWord: vi.fn(async ({ text }) => ({ status: 'ok', lemma: text === 'jookseb' ? 'jooksma' : text, translation: 'бегать', words: [], forms: { line: 'jooksma, joosta, jookseb', forms: [] } })),
  preferredLanguage: vi.fn(async () => 'ru'),
  words: { listForStudent: vi.fn(async () => []), add: vi.fn(async (input) => input), addStudentWord: vi.fn(async (input) => ({ id: 'w1', ...input })) },
  ...overrides,
});

// the caret under the pointer: always inside „jookseb”
const pointAtWord = () => {
  const node = screen.getByTestId('text').firstChild;
  document.caretRangeFromPoint = () => ({ startContainer: node, startOffset: 7 });
};

afterEach(() => { delete document.caretRangeFromPoint; });

describe('„Puuduta sõna” on the board', () => {
  it('a double click on a sheet word: base form, translation, „Lisa sõnastikku” → the student’s own word', async () => {
    const tools = service();
    render(<Board service={tools} />);
    pointAtWord();
    fireEvent.doubleClick(screen.getByTestId('text'), { clientX: 10, clientY: 10 });
    expect(await screen.findByText('jooksma')).toBeTruthy();
    expect(screen.getByText('бегать')).toBeTruthy();
    expect(tools.checkOwnWord).toHaveBeenCalledWith({ text: 'jookseb', lang: 'et', tgt: 'ru' });
    fireEvent.click(screen.getByText('Lisa sõnastikku'));
    expect(await screen.findByText('Lisatud sõnastikku.')).toBeTruthy();
    expect(tools.words.addStudentWord).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', word: 'jooksma', translation: 'бегать' }));
    // Escape closes it
    fireEvent.keyDown(window, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByText('jooksma')).toBeNull());
  });

  it('a finger’s tap opens it; the same word again is not asked from the server again', async () => {
    const tools = service();
    render(<Board service={tools} />);
    pointAtWord();
    const tap = () => {
      fireEvent.pointerDown(screen.getByTestId('text'), { pointerType: 'touch', isPrimary: true, pointerId: 1, clientX: 10, clientY: 10 });
      fireEvent.pointerUp(screen.getByTestId('text'), { pointerType: 'touch', pointerId: 1, clientX: 11, clientY: 10 });
    };
    tap();
    expect(await screen.findByText('jooksma')).toBeTruthy();
    fireEvent.keyDown(window, { key: 'Escape' });
    tap();
    expect(await screen.findByText('jooksma')).toBeTruthy();
    expect(tools.checkOwnWord).toHaveBeenCalledTimes(1);
  });

  it('not while drawing, and a teacher filling the sheet keeps the sheet’s own tools', async () => {
    const tools = service();
    const { unmount } = render(<Board tool="pen" service={tools} />);
    pointAtWord();
    fireEvent.doubleClick(screen.getByTestId('text'), { clientX: 10, clientY: 10 });
    await act(async () => { await new Promise((resolve) => globalThis.setTimeout(resolve, 5)); });
    expect(screen.queryByText('Lisa sõnastikku')).toBeNull();
    unmount();
    render(<Board staff service={tools} />);
    pointAtWord();
    fireEvent.doubleClick(screen.getByTestId('text'), { clientX: 10, clientY: 10 });
    await act(async () => { await new Promise((resolve) => globalThis.setTimeout(resolve, 5)); });
    expect(screen.queryByText('Lisa sõnastikku')).toBeNull();
    expect(tools.checkOwnWord).not.toHaveBeenCalled();
  });

  it('opens at once with „Otsin…”, shows a partial answer, and „Proovi uuesti” asks again', async () => {
    let answer;
    const checkOwnWord = vi.fn(() => new Promise((resolve) => { answer = resolve; }));
    const tools = service({ checkOwnWord });
    render(<Board service={tools} />);
    pointAtWord();
    fireEvent.doubleClick(screen.getByTestId('text'), { clientX: 10, clientY: 10 });
    expect(await screen.findByText(/Otsin…/)).toBeTruthy();
    expect(document.querySelector('.sb-word-tap[aria-label="Sõna jookseb"]')).toBeTruthy();
    // the translation service was slow: the base form came, the translation did not
    await act(async () => { answer({ status: 'ok', lemma: 'jooksma', translation: '', words: [], partial: true, missing: ['translation'] }); });
    expect(await screen.findByText('jooksma')).toBeTruthy();
    expect(screen.queryByText(/Otsin…/)).toBeNull();
    expect(screen.getByText('Tõlget ei saanud praegu leida.').getAttribute('role')).toBe('alert');
    fireEvent.click(screen.getByText('Proovi uuesti'));
    expect(await screen.findByText(/Otsin…/)).toBeTruthy();
    await act(async () => { answer({ status: 'ok', lemma: 'jooksma', translation: 'бегать', words: [] }); });
    expect(await screen.findByText('бегать')).toBeTruthy();
    expect(screen.queryByText('Proovi uuesti')).toBeNull();
    expect(checkOwnWord).toHaveBeenCalledTimes(2);
  });

  it('a failed lookup (timeout) says so and offers „Proovi uuesti”; the spelling part missing is named', async () => {
    const checkOwnWord = vi.fn()
      .mockRejectedValueOnce(new Error('Keeletööriist ei vastanud õigel ajal.'))
      .mockResolvedValueOnce({ status: 'unchecked', lemma: '', translation: 'бежит', words: [], partial: true, missing: ['spelling', 'forms'] });
    render(<Board service={service({ checkOwnWord })} />);
    pointAtWord();
    fireEvent.doubleClick(screen.getByTestId('text'), { clientX: 10, clientY: 10 });
    expect(await screen.findByText('Tõlget ei saanud praegu leida.')).toBeTruthy();
    fireEvent.click(screen.getByText('Proovi uuesti'));
    expect(await screen.findByText('бежит')).toBeTruthy();
    expect(screen.getByText('Põhivormi ei jõudnud leida.')).toBeTruthy();
    expect(screen.getByText('Proovi uuesti')).toBeTruthy();
  });

  it('marks the board so the sheet’s own double-click card stands aside', () => {
    const { container } = render(<Board service={service()} />);
    expect(container.querySelector('.sb').dataset.wordTap).toBe('1');
  });
});

describe('„õ ä ö ü” bar', () => {
  it('shows on a focused answer, puts the letter at the caret of a React field and keeps the focus', async () => {
    render(<Board service={service()} />);
    const input = screen.getByLabelText('Vastus');
    input.focus();
    input.setSelectionRange(4, 4);
    const key = await screen.findByRole('button', { name: 'Lisa ä', hidden: true });
    expect(fireEvent.mouseDown(key)).toBe(false); // default prevented: the field keeps the focus
    fireEvent.click(key);
    expect(screen.getByTestId('state').textContent).toBe('Ma lähen');
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(5);
    // capitals with the toggle
    fireEvent.click(screen.getByRole('button', { name: 'Suurtähed', hidden: true }));
    fireEvent.click(screen.getByRole('button', { name: 'Lisa Õ', hidden: true }));
    expect(screen.getByTestId('state').textContent).toBe('Ma läÕhen');
    // gone when the field loses the focus
    input.blur();
    await waitFor(() => expect(screen.queryByRole('toolbar', { name: 'Eesti tähed', hidden: true })).toBeNull());
  });

  it('the teacher folds it to a small „õ” (remembered on this device); a student has no ×', async () => {
    const { unmount } = render(<Board staff service={service()} />);
    screen.getByLabelText('Vastus').focus();
    fireEvent.click(await screen.findByRole('button', { name: 'Peida eesti tähed', hidden: true }));
    expect(screen.queryByRole('button', { name: 'Lisa õ', hidden: true })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Näita eesti tähti', hidden: true }));
    expect(screen.getByRole('button', { name: 'Lisa õ', hidden: true })).toBeTruthy();
    unmount();
    render(<Board service={service()} />);
    screen.getByLabelText('Vastus').focus();
    await screen.findByRole('button', { name: 'Lisa õ', hidden: true });
    expect(screen.queryByRole('button', { name: 'Peida eesti tähed', hidden: true })).toBeNull();
  });
});
