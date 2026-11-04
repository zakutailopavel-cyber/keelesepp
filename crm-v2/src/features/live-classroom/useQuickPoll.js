import { useCallback, useEffect, useState } from 'react';
import { livePollsService } from '../../services/firebase/livePolls.js';
import { studentNotesService } from '../../services/firebase/studentNotes.js';
import { noteRecord } from '../board/bookmarkModel.js';
import { POLL_TIMER_LABEL, mistakeNoteText, nextRound, pollDraft } from './quickPoll.js';

const quietly = (start, fallback = () => {}) => { try { return start(); } catch { return fallback; } };

/**
 * The room's „Kiirküsimus” (quickPoll.js): follows the poll; the teacher also the answers and the key, a student his
 * own answer. Teacher actions: start (with an optional time limit on the room's countdown), reveal, close and save a
 * wrong answer into the student's „Minu vead” (studentNotes). `studentIdOf(uid)` → the student card of an answer.
 */
export function useQuickPoll({
  kind = 'lesson', roomId = '', user, teacher = false, enabled = true, participantUids = [], studentIdOf = () => '',
  timer = null, service = livePollsService, notes = studentNotesService,
}) {
  const [poll, setPoll] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [myAnswer, setMyAnswer] = useState(null);
  const [key, setKey] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState({});
  const uid = user?.uid || '';
  const on = Boolean(enabled && roomId && uid && service?.subscribe);

  useEffect(() => {
    if (!on) return undefined;
    return quietly(() => service.subscribe(kind, roomId, setPoll, () => setPoll(null)));
  }, [on, kind, roomId, service]);
  useEffect(() => {
    if (!on || !teacher || !service.subscribeAnswers) return undefined;
    return quietly(() => service.subscribeAnswers(kind, roomId, setAnswers, () => setAnswers([])));
  }, [on, teacher, kind, roomId, service]);
  useEffect(() => {
    if (!on || !teacher || !service.subscribeKey) return undefined;
    return quietly(() => service.subscribeKey(kind, roomId, setKey, () => setKey(null)));
  }, [on, teacher, kind, roomId, service]);
  useEffect(() => {
    if (!on || teacher || !service.subscribeMyAnswer) return undefined;
    return quietly(() => service.subscribeMyAnswer(kind, roomId, uid, setMyAnswer, () => setMyAnswer(null)));
  }, [on, teacher, kind, roomId, uid, service]);

  const run = useCallback(async (work, fallback) => {
    setBusy(true);
    setError('');
    try { await work(); return true; } catch (nextError) { setError(nextError?.message || fallback); return false; } finally { setBusy(false); }
  }, []);

  // the right option of the current round (the teacher's key; after „Näita vastust” also on the poll)
  const correctIndex = poll?.status === 'revealed' ? poll.correctIndex : key && poll && key.round === poll.round ? key.correctIndex : -1;
  const participantKey = participantUids.join('|');

  const start = async (input) => {
    const draft = pollDraft(input);
    if (!draft.ok) { setError(draft.error); return false; }
    const uids = participantKey.split('|').filter(Boolean);
    if (!uids.length) { setError('Tunnis ei ole õpilasi, kellele küsida.'); return false; }
    const ok = await run(() => service.start({ kind, roomId, participantUids: uids, draft: draft.value, round: nextRound(poll), user }), 'Kiirküsimust ei saanud alustada.');
    if (ok && draft.value.timeLimitSec && timer?.actions?.start) timer.actions.start(draft.value.timeLimitSec * 1000, POLL_TIMER_LABEL);
    if (ok) setSaved({});
    return ok;
  };
  const stopOwnTimer = () => { if (timer?.active && timer.countdown?.label === POLL_TIMER_LABEL) timer.actions?.stop?.(); };
  const reveal = async () => {
    if (correctIndex < 0) { setError('Õige vastus ei ole teada — alusta küsimust uuesti.'); return false; }
    const ok = await run(() => service.reveal(kind, roomId, correctIndex), 'Vastust ei saanud näidata.');
    if (ok) stopOwnTimer();
    return ok;
  };
  const close = async () => {
    const ok = await run(() => service.close(kind, roomId), 'Kiirküsimust ei saanud lõpetada.');
    if (ok) stopOwnTimer();
    return ok;
  };
  const answer = (choice, name = '') => run(() => service.answer({ kind, roomId, round: poll.round, choice, user, name }), 'Vastust ei saanud saata.');
  // one teacher click: the wrong answer becomes a note in the student's „Minu vead” → „Märkmed tunnist”
  const saveMistake = async (row) => {
    const studentId = studentIdOf(row.uid);
    if (!studentId) { setError('Selle õpilase kaarti ei leitud.'); return false; }
    const text = mistakeNoteText(poll, row.choice, correctIndex);
    const ok = await run(() => notes.add(noteRecord({ studentId, text, pageTitle: 'Kiirküsimus', user, staff: true })), 'Viga ei saanud „Minu vead” alla salvestada.');
    if (ok) setSaved((current) => ({ ...current, [`${poll.round}:${row.uid}`]: true }));
    return ok;
  };
  const isSaved = (row) => Boolean(poll && saved[`${poll.round}:${row.uid}`]);

  return { poll, answers, myAnswer, correctIndex, error, busy, actions: { start, reveal, close, answer, saveMistake }, isSaved, clearError: () => setError('') };
}
