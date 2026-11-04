import { describe, expect, it } from 'vitest';
import {
  GAP, gapParts, mistakeNoteText, nextRound, normalizeAnswer, normalizeGap, normalizePoll, pollDraft, pollIdFor, pollTimeUp, pollTitle,
  studentPollState, tallyAnswers,
} from './quickPoll.js';

const poll = (extra = {}) => normalizePoll({
  kind: 'lesson', roomId: 'inv-1', teacherUid: 't1', participantUids: ['u1', 'u2', 'u3'], round: 2, mode: 'choice',
  question: 'Mis on „kass” mitmuses?', sentence: '', options: ['kassid', 'kassud', 'kasside'], timeLimitSec: 0, status: 'open', correctIndex: -1, ...extra,
});

describe('quick poll draft', () => {
  it('keeps a question with 2–4 options and the right one, dropping empty rows', () => {
    const draft = pollDraft({ mode: 'choice', question: '  Mis   on „kass” mitmuses? ', options: ['kassid', '', 'kassud'], correctIndex: 2, timeLimitSec: 30 });
    expect(draft).toEqual({ ok: true, value: { mode: 'choice', question: 'Mis on „kass” mitmuses?', sentence: '', options: ['kassid', 'kassud'], correctIndex: 1, timeLimitSec: 30 } });
  });

  it('says what is missing in plain Estonian', () => {
    expect(pollDraft({ mode: 'choice', question: '', options: ['a', 'b'], correctIndex: 0 }).error).toBe('Kirjuta küsimus.');
    expect(pollDraft({ mode: 'choice', question: 'K?', options: ['a', ''], correctIndex: 0 }).error).toBe('Lisa vähemalt 2 vastusevarianti.');
    expect(pollDraft({ mode: 'choice', question: 'K?', options: ['a', 'b', 'c', 'd', 'e'], correctIndex: 0 }).error).toBe('Kõige rohkem 4 vastusevarianti.');
    expect(pollDraft({ mode: 'choice', question: 'K?', options: ['Kass', 'kass'], correctIndex: 0 }).error).toBe('Vastusevariandid peavad olema erinevad.');
    expect(pollDraft({ mode: 'choice', question: 'K?', options: ['a', '', 'b'], correctIndex: 1 }).error).toBe('Märgi õige vastus.');
    expect(pollDraft({ mode: 'gap', sentence: 'Ma elan Tallinnas.', options: ['a', 'b'], correctIndex: 0 }).error).toBe('Kirjuta lause ja märgi lünk: ___');
  });

  it('„Vali õige vorm”: a gap written as … or __ becomes ___, the hint defaults', () => {
    const draft = pollDraft({ mode: 'gap', sentence: 'Ma elan … (Tallinn).', options: ['Tallinnas', 'Tallinnasse', 'Tallinnast'], correctIndex: 0, timeLimitSec: 7 });
    expect(draft.value).toMatchObject({ mode: 'gap', question: 'Vali õige vorm', sentence: `Ma elan ${GAP} (Tallinn).`, correctIndex: 0, timeLimitSec: 0 });
    expect(normalizeGap('Lähen __ poodi')).toBe(`Lähen ${GAP} poodi`);
    expect(gapParts(`Ma elan ${GAP} (Tallinn).`)).toEqual(['Ma elan ', ' (Tallinn).']);
    expect(gapParts('ilma lüngata')).toEqual(['ilma lüngata', '']);
  });
});

describe('quick poll state', () => {
  it('one doc per room and the next round', () => {
    expect(pollIdFor('lesson', 'inv-1')).toBe('lesson_inv-1');
    expect(pollIdFor('group', 'room-1')).toBe('group_room-1');
    expect(nextRound(null)).toBe(1);
    expect(nextRound(poll())).toBe(3);
  });

  it('hides the right option until it is revealed', () => {
    expect(poll({ correctIndex: 1 }).correctIndex).toBe(-1);
    expect(poll({ status: 'revealed', correctIndex: 1 }).correctIndex).toBe(1);
    expect(normalizePoll({ options: ['a'] })).toBeNull();
    expect(normalizeAnswer('u1', { round: 2, choice: 1, answeredAt: 5 })).toEqual({ uid: 'u1', name: '', round: 2, choice: 1, answeredAt: 5 });
  });

  it('the teacher sees counts, names, who is missing and who was wrong; old rounds do not count', () => {
    const answers = [
      { uid: 'u1', name: 'Mari', round: 2, choice: 0, answeredAt: 2 },
      { uid: 'u2', name: '', round: 2, choice: 1, answeredAt: 1 },
      { uid: 'u3', name: 'Jaan', round: 1, choice: 0, answeredAt: 0 },
    ];
    const tally = tallyAnswers(poll(), answers, { correctIndex: 0, names: { u2: 'Kati', u3: 'Jaan' } });
    expect(tally.answered).toBe(2);
    expect(tally.total).toBe(3);
    expect(tally.missing).toEqual(['Jaan']);
    expect(tally.options.map((item) => [item.count, item.correct, item.names])).toEqual([[1, true, ['Mari']], [1, false, ['Kati']], [0, false, []]]);
    expect(tally.rows.map((row) => [row.name, row.correct])).toEqual([['Kati', false], ['Mari', true]]);
    expect(tallyAnswers(poll(), answers).rows.every((row) => row.correct === null)).toBe(true);
  });

  it('the student card: answer, sent, right / wrong / missed after the reveal, late when the time is up', () => {
    const mine = { round: 2, choice: 1 };
    expect(studentPollState(null, null)).toBe('none');
    expect(studentPollState(poll({ status: 'closed' }), mine)).toBe('none');
    expect(studentPollState(poll(), null)).toBe('answer');
    expect(studentPollState(poll(), { round: 1, choice: 1 })).toBe('answer');
    expect(studentPollState(poll(), mine)).toBe('sent');
    expect(studentPollState(poll(), null, { expired: true })).toBe('late');
    expect(studentPollState(poll({ status: 'revealed', correctIndex: 1 }), mine)).toBe('right');
    expect(studentPollState(poll({ status: 'revealed', correctIndex: 0 }), mine)).toBe('wrong');
    expect(studentPollState(poll({ status: 'revealed', correctIndex: 0 }), null)).toBe('missed');
  });

  it('the time limit is up only when the poll’s own countdown expired', () => {
    const timed = poll({ timeLimitSec: 30 });
    expect(pollTimeUp(timed, { countdown: { label: 'Kiirküsimus' }, expired: true })).toBe(true);
    expect(pollTimeUp(timed, { countdown: { label: 'Loe tekst' }, expired: true })).toBe(false);
    expect(pollTimeUp(poll(), { countdown: { label: 'Kiirküsimus' }, expired: true })).toBe(false);
  });

  it('a wrong answer becomes a „Minu vead” note with the right form', () => {
    expect(mistakeNoteText(poll(), 1, 0)).toBe('Kiirküsimus: Mis on „kass” mitmuses?\nÕige vastus: kassid\nSinu vastus: kassud');
    const gap = poll({ mode: 'gap', question: 'Vali õige vorm', sentence: `Ma elan ${GAP} (Tallinn).`, options: ['Tallinnas', 'Tallinnasse'] });
    expect(pollTitle(gap)).toBe(`Ma elan ${GAP} (Tallinn).`);
    expect(mistakeNoteText(gap, 1, 0)).toBe(`Kiirküsimus: Ma elan ${GAP} (Tallinn).\nÕige: Ma elan Tallinnas (Tallinn).\nSinu vastus: Tallinnasse`);
  });
});
