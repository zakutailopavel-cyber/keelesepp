import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TextAnnotationEditor from './TextAnnotationEditor.jsx';

const field = { blockId: 'writing', label: 'Kirjelda oma peret', text: 'Minu pere on suur.' };
const annotation = { id: 'annotation-1', blockId: 'writing', start: 5, end: 9, selectedText: 'pere', parandus: 'perekond', selgitus: 'Kasuta täpsemat sõna.', createdAt: '2026-08-04T10:00:00.000Z', dismissed: false };

describe('TextAnnotationEditor', () => {
  it('shows highlighted corrections to a student without edit controls', () => {
    render(<TextAnnotationEditor fields={[field]} annotations={[annotation]} />);
    expect(screen.getByText('pere').tagName).toBe('MARK');
    expect(screen.getByText(/perekond/)).toBeInTheDocument();
    expect(screen.getByText(/Kasuta täpsemat sõna/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eemalda parandus/ })).not.toBeInTheDocument();
  });

  it('turns a teacher text selection into a persisted annotation', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    const { container } = render(<TextAnnotationEditor fields={[field]} annotations={[]} editable onChange={onChange} />);
    const source = container.querySelector('.annotation-source-text');
    const textNode = source.querySelector('span').firstChild;
    const range = document.createRange();
    range.setStart(textNode, 5);
    range.setEnd(textNode, 9);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    fireEvent.mouseUp(source);

    expect(screen.getByText('“pere”')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Parandus'), { target: { value: 'perekond' } });
    fireEvent.change(screen.getByLabelText('Selgitus'), { target: { value: 'Kasuta täpsemat sõna.' } });
    fireEvent.click(screen.getByRole('button', { name: /Salvesta parandus/ }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ blockId: 'writing', start: 5, end: 9, selectedText: 'pere', parandus: 'perekond', selgitus: 'Kasuta täpsemat sõna.', dismissed: false }),
    ]));
    expect(await screen.findByRole('status')).toHaveTextContent('Parandus salvestati');
  });

  it('removes an existing annotation through the same persistence callback', async () => {
    const onChange = vi.fn().mockResolvedValue(undefined);
    render(<TextAnnotationEditor fields={[field]} annotations={[annotation]} editable onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Eemalda parandus 1' }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([]));
  });
});
