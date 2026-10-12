import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TopicsSection from './TopicsSection.jsx';

const ET = ['nimi', 'vanus', 'pere', 'ema', 'isa', 'vend', 'õde', 'laps'];
const words = {
  'a2-001': ET.slice(0, 4).map((et) => ({ et, ru: `ru-${et}`, ex: '' })),
  'a2-002': ET.slice(4).map((et) => ({ et, ru: `ru-${et}`, ex: '' })),
  'a2-003': ['kodu', 'tuba', 'köök', 'aken', 'uks'].map((et) => ({ et, ru: `ru-${et}`, ex: '' })),
  'a2-004': ['linn', 'buss', 'pood', 'park'].map((et) => ({ et, ru: `ru-${et}`, ex: '' })),
};
const catalog = { levels: [{ key: 'A2', label: 'A2', modules: [
  { key: 'A2|1', label: '1. Mina ja pere', lessons: [{ id: 'a2-001' }, { id: 'a2-002' }] },
  { key: 'A2|2', label: '2. Kodu', lessons: [{ id: 'a2-003' }] },
  { key: 'A2|3', label: '3. Linn', lessons: [{ id: 'a2-004' }] },
] }] };
const idOf = (et) => { const i = ET.indexOf(et); return i < 4 ? `lw_s1_a2-001_${i}` : `lw_s1_a2-002_${i - 4}`; };
const memory = (learned = []) => {
  const data = new Map([['keelesepp.vocabTopics.s1.A2|1', JSON.stringify(learned)]]);
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
};

function renderSection({ own = [], learned = [] } = {}) {
  const wordsService = { addLessonWords: vi.fn().mockResolvedValue([]) };
  render(<TopicsSection catalog={catalog} studentId="s1" studentLevel="A2" words={own} wordsService={wordsService} user={{ uid: 'u1' }}
    loadWords={vi.fn().mockResolvedValue(words)} storage={memory(learned)} />);
  return wordsService;
}

// answers every question of the confirmation test right (or the first `wrong` ones wrong)
function answerTest(wrong = 0) {
  let mistakes = wrong;
  for (const select of screen.queryAllByRole('combobox', { name: /^Tähendus:/ })) {
    const et = select.getAttribute('aria-label').replace('Tähendus: ', '');
    fireEvent.change(select, { target: { value: mistakes > 0 ? '' : `ru-${et}` } });
    mistakes -= 1;
  }
  for (const item of within(document.querySelector('.vt-questions')).getAllByRole('listitem')) {
    const ask = item.querySelector('strong').textContent;
    const input = item.querySelector('input');
    if (input) fireEvent.change(input, { target: { value: mistakes > 0 ? 'vale' : ask.replace('ru-', '') } });
    else fireEvent.click(within(item).getByRole('button', { name: mistakes > 0 ? (n) => n !== `ru-${ask}` : `ru-${ask}` }));
    mistakes -= 1;
  }
  fireEvent.click(screen.getByRole('button', { name: 'Vaata tulemust' }));
}

describe('Teemad', () => {
  it('shows the open topic, locked topics with a preview and the passed ones', async () => {
    renderSection();
    expect(await screen.findByText('1. Mina ja pere')).toBeInTheDocument();
    expect(screen.getByText('8 sõna · avatud')).toBeInTheDocument();
    expect(screen.getByText('5 sõna · lukus')).toBeInTheDocument();
    expect(screen.getByText('kodu, tuba, köök, aken, uks…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kinnita teadmisi/ })).toBeDisabled();
    expect(screen.getAllByRole('button', { name: /Kordamine/ })).toHaveLength(1);
  });

  it('a topic whose words are all mine is passed and the next one opens', async () => {
    renderSection({ own: ET.map((et) => ({ id: idOf(et), word: et })) });
    expect(await screen.findByText('8 sõna · läbitud')).toBeInTheDocument();
    expect(screen.getByText('5 sõna · avatud')).toBeInTheDocument();
    expect(screen.getByText(/Läbitud 1\/3 teemat/)).toBeInTheDocument();
  });

  it('the repetition cycle opens „Õpi” over the topic words', async () => {
    renderSection();
    fireEvent.click(await screen.findByRole('button', { name: /Kordamine/ }));
    expect(screen.getByRole('region', { name: 'Õppimine: 1. Mina ja pere · Kordamine' })).toBeInTheDocument();
    expect(screen.getByText('8 kaarti')).toBeInTheDocument();
  });

  it('after the cycle a passed test adds the topic words to my words in one call', async () => {
    const service = renderSection({ learned: ET.map(idOf) });
    fireEvent.click(await screen.findByRole('button', { name: /Kinnita teadmisi/ }));
    answerTest();
    await waitFor(() => expect(service.addLessonWords).toHaveBeenCalledTimes(1));
    const { studentId, items } = service.addLessonWords.mock.calls[0][0];
    expect(studentId).toBe('s1');
    expect(items.map((item) => item.id).sort()).toEqual(ET.map(idOf).sort());
    expect(await screen.findByText(/teema läbitud!/)).toBeInTheDocument();
    expect(screen.getByText(/8 sõna lisati sinu sõnade hulka/)).toBeInTheDocument();
  });

  it('a failed test shows the score and the missed words and can be retried', async () => {
    const service = renderSection({ learned: ET.map(idOf) });
    fireEvent.click(await screen.findByRole('button', { name: /Kinnita teadmisi/ }));
    answerTest(3);
    expect(await screen.findByText(/5\/8 \(63 %\) — veel mitte/)).toBeInTheDocument();
    expect(document.querySelectorAll('.vt-result .vs-missed li')).toHaveLength(3);
    expect(service.addLessonWords).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Proovi uuesti' }));
    expect(screen.getByRole('button', { name: 'Vaata tulemust' })).toBeInTheDocument();
  });
});
