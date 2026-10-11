import { act, fireEvent, render, screen } from '@testing-library/react';
import PetGames from './PetGames.jsx';
import { courseTopics, gameRounds, guessable, learnerTopics, sheetItems, sheetLanguage, sortRound } from './petGames.js';

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

  const courseDoc = { meta: { title: 'Pere', level: 'A2' }, blocks: [
    { type: 'categorize', data: { groups: [{ name: 'Välimus', words: 'pikk, lühike, sale, prillidega' }, { name: 'Iseloom', words: 'sõbralik, rahulik, naljakas' }] } },
    { type: 'crossword', data: { rows: [{ clue: 'Minu ema ema', answer: 'vanaema' }, { clue: 'Poeg või tütar', answer: 'laps' }, { clue: 'Ema ja isa koos', answer: 'vanemad' }, { clue: 'kaks sõna', answer: 'ema isa' }] } },
    { type: 'vocab', data: { words: 'õde — сестра, vend — брат, kõigepealt — сначала' } },
    { type: 'transformation', data: { rows: [{ from: 'Mul on vend.', prompt: 'Minu …', answer: 'Minu vend elab Soomes.' }] } },
    { type: 'dialogue', data: { lines: [{ who: 'A', text: 'Kes see on?' }, { who: 'B', text: 'See on meie uus [õpetaja].' }, { who: 'B', text: 'Ta on [rahulik] ja kannatlik.' }] } },
  ] };

  it('takes sorting, letter guessing, transformations and dialogue gaps from course sheets', () => {
    const items = sheetItems(courseDoc);
    expect(items.sort[0].groups.map((g) => g.name)).toEqual(['Välimus', 'Iseloom']);
    expect(items.guess.map((g) => g.word)).toEqual(['vanaema', 'laps', 'vanemad', 'õde', 'vend', 'kõigepealt']);
    expect(items.guess[3]).toEqual({ clue: 'сестра', word: 'õde' });
    expect(items.order.map((o) => o.sentence)).toContain('Minu vend elab Soomes.');
    expect(items.catch.map((c) => c.answer)).toEqual(['õpetaja', 'rahulik']);
    expect(guessable('ema isa')).toBe(false);
    expect(guessable('šokolaad')).toBe(true);
  });

  it('builds topics from the published sheets of attended lessons, newest first, one per lesson', () => {
    const lessons = [
      { date: '2026-10-01', status: 'Toimunud', topicLessonId: 'l1', topic: 'Pere' },
      { date: '2026-10-08', status: 'Puudus_p', topicLessonId: 'l2', topic: 'Puudutud' },
      { date: '2026-10-05', status: 'Toimunud', topicLessonId: 'l1', topic: 'Pere' },
      { date: '2026-10-06', status: 'Toimunud', topicLessonId: 'l3', topic: 'Mustand' },
    ];
    const sheets = {
      l1: [{ worksheetDoc: courseDoc }, { worksheetDocStatus: 'draft', worksheetDoc: doc }],
      l2: [{ worksheetDoc: doc }],
      l3: [{ worksheetDocStatus: 'draft', worksheetDoc: doc }],
    };
    const topics = courseTopics(lessons, sheets);
    expect(topics.map((t) => t.id)).toEqual(['course:l1']);
    expect(topics[0]).toMatchObject({ source: 'course', title: 'Pere', assignedAt: '2026-10-05' });
    // the draft sheet (not published) is not played
    expect(topics[0].worksheetDoc.blocks).toHaveLength(courseDoc.blocks.length);
    const listed = learnerTopics(topics);
    expect(listed[0].games).toEqual(expect.arrayContaining(['sort', 'guess']));
    expect(listed[0].source).toBe('course');
  });

  it('plays „Sorteeri”: the right basket counts, a wrong one shows where the word belongs', () => {
    vi.useFakeTimers();
    const topics = learnerTopics(courseTopics([{ date: '2026-10-01', topicLessonId: 'l1', topic: 'Pere' }], { l1: [{ worksheetDoc: courseDoc }] }));
    const round = sortRound(topics[0], seq());
    expect(round.baskets).toEqual(['Välimus', 'Iseloom']);
    expect(round.words.length).toBe(7);
    const onDone = vi.fn();
    render(<PetGames topics={topics} kind="kakk" onDone={onDone} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Sorteeri/ }));
    for (let k = 0; k < 7; k += 1) {
      const word = document.querySelector('.pg-word').textContent;
      const basket = ['pikk', 'lühike', 'sale', 'prillidega'].includes(word) ? 'Välimus' : 'Iseloom';
      fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${k === 0 ? (basket === 'Välimus' ? 'Iseloom' : 'Välimus') : basket}`) }));
      if (k === 0) expect(screen.getByRole('status')).toHaveTextContent(`See läheb korvi „${basket}”`);
      act(() => { vi.advanceTimersByTime(2000); });
    }
    expect(onDone).toHaveBeenCalledWith(6);
    vi.useRealTimers();
  });

  it('plays „Arva sõna”: letters fill the word, the pet is told the word after six misses', () => {
    vi.useFakeTimers();
    const topics = [{ id: 't', title: 'Pere', items: { catch: [], pairs: [], order: [], truth: [], sort: [], guess: [{ clue: 'Poeg või tütar', word: 'laps' }, { clue: 'сестра', word: 'õde' }, { clue: 'брат', word: 'vend' }] }, games: ['guess'] }];
    const onDone = vi.fn();
    render(<PetGames topics={topics} kind="siil" onDone={onDone} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Arva sõna/ }));
    for (let r = 0; r < 3; r += 1) {
      const clue = screen.getByText(/Vihje/).textContent;
      const word = clue.includes('Poeg') ? 'laps' : clue.includes('сестра') ? 'õde' : 'vend';
      if (r === 0) {
        ['b', 'c', 'f', 'g', 'h', 'i'].forEach((ch) => fireEvent.click(screen.getByRole('button', { name: `Täht ${ch}` })));
        expect(screen.getByRole('status')).toHaveTextContent(`Sõna oli: ${word}`);
      } else {
        [...new Set(word)].forEach((ch) => fireEvent.click(screen.getByRole('button', { name: `Täht ${ch}` })));
        expect(screen.getByRole('status')).toHaveTextContent('Arvasid ära!');
      }
      act(() => { vi.advanceTimersByTime(2500); });
    }
    expect(onDone).toHaveBeenCalledWith(2);
    vi.useRealTimers();
  });
  it('turns option gaps of a cloze text into „Püüa sõna” rounds with their own options', () => {
    const items = sheetItems({ blocks: [{ type: 'cloze', data: { passage: 'Ladu {*asub|asuma|asudes} Ringtee ääres. Seal töötab {*kakskümmend|kahekümne} inimest.\n\nSee võtab {*aega|aeg|ajal}.' } }] });
    expect(items.catch).toHaveLength(3);
    expect(items.catch[0]).toMatchObject({ before: 'Ladu', after: 'Ringtee ääres.', answer: 'asub', options: ['asub', 'asuma', 'asudes'] });
    expect(items.catch[1]).toMatchObject({ before: 'Seal töötab', after: 'inimest.', answer: 'kakskümmend', options: ['kakskümmend', 'kahekümne'] });
    expect(items.catch[2]).toMatchObject({ before: 'See võtab', after: '.', answer: 'aega' });
    expect(items.catch[0]).not.toHaveProperty('own');
    expect(items.order.map((o) => o.sentence)).toContain('Ladu asub Ringtee ääres.');
  });

  it('keeps sorting cards word-sized and letter guessing Estonian', () => {
    const items = sheetItems({ blocks: [
      { type: 'categorize', data: { groups: [{ name: 'Toit', words: 'leib, piim, värske kurk, Ma söön hommikul alati putru' }, { name: 'Jook', words: 'vesi, tee' }] } },
      { type: 'categorize', data: { groups: [{ name: 'Fakt', words: 'Tallinn on Eesti pealinn., Eestis on palju metsa.' }, { name: 'Arvamus', words: 'Tallinn on kõige ilusam linn., Talv on liiga pikk.' }] } },
    ] });
    expect(items.sort).toHaveLength(1);
    expect(items.sort[0].groups[0].words).toEqual(['leib', 'piim', 'värske kurk']);
    const en = { meta: { language: 'en' }, blocks: [{ type: 'vocab', data: { words: 'exchange — vahetus, nervous — närviline, prefer — eelistama' } }] };
    expect(sheetItems(en).guess).toEqual([]);
    expect(sheetLanguage({}, 'en-b1-001')).toBe('en');
    expect(sheetLanguage({}, 'b1-001')).toBe('et');
    const enTopic = courseTopics([{ date: '2026-10-01', topicLessonId: 'en-b1-001', topic: 'Getting to know you' }], { 'en-b1-001': [{ worksheetDoc: { blocks: en.blocks } }] });
    expect(sheetItems(enTopic[0].worksheetDoc).guess).toEqual([]);
  });

  it('never plays the licensed textbook sheet', () => {
    const book = { meta: { title: 'Õpik', phase: 'opik' }, blocks: doc.blocks };
    const topics = courseTopics([{ date: '2026-10-01', topicLessonId: 'l1', topic: 'Pere' }], { l1: [{ id: 'opik', worksheetDoc: doc }, { id: 'x', worksheetDoc: book }] });
    expect(topics).toEqual([]);
    expect(learnerTopics([{ id: 'a', status: 'new', worksheetDoc: book, title: 'Õpik' }])).toEqual([]);
    const mixed = courseTopics([{ date: '2026-10-01', topicLessonId: 'l1', topic: 'Pere' }], { l1: [{ id: 'practice', worksheetDoc: courseDoc }, { id: 'opik', worksheetDoc: doc }] });
    expect(mixed[0].worksheetDoc.blocks).toHaveLength(courseDoc.blocks.length);
  });
});
