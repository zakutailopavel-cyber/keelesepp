/* global setTimeout, clearTimeout */
import { useEffect, useRef, useState } from 'react';
import { homeworkService as defaultHomework } from '../../services/firebase/homework.js';
import { petsService } from '../../services/firebase/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { PetArt } from './PetCard.jsx';
import './pet.css';

const SHOW_MS = 5000;

/**
 * The student's pet in the Live Classroom: sits in the corner of the board, says hello and cheers when the teacher
 * adds a new word or gives homework in this lesson. Nothing is written; a student without a pet sees nothing.
 */
export default function RoomPet({
  user, studentId, invitationId,
  repository = petsService, wordsService = studentWordsService, homeworkService = defaultHomework,
}) {
  const [pet, setPet] = useState(null);
  const [say, setSay] = useState(null);
  const seen = useRef({ words: null, homework: null });
  const timer = useRef(null);
  const speak = (text, hint) => {
    clearTimeout(timer.current);
    setSay({ text, hint });
    timer.current = setTimeout(() => setSay(null), SHOW_MS);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => repository.get(user?.uid)).then((value) => {
      if (!alive || !value?.kind || value.optedOut || value.hidden) return;
      setPet(value);
      speak(`Tere! ${value.name} on ka tunnis.`, `Привет! ${value.name} тоже на уроке.`);
    }).catch(() => {});
    return () => { alive = false; };
  }, [repository, user?.uid]);

  const active = Boolean(pet);
  useEffect(() => {
    if (!active || !studentId) return undefined;
    try {
      return wordsService.subscribeForStudent(studentId, (items) => {
        const lesson = items.filter((item) => item.invitationId === invitationId);
        const known = seen.current.words;
        seen.current.words = new Set(lesson.map((item) => item.id));
        if (!known) return;
        const fresh = lesson.find((item) => !known.has(item.id));
        if (fresh) speak(`Uus sõna: ${fresh.word}!`, fresh.translation ? `Новое слово: ${fresh.word} — ${fresh.translation}` : `Новое слово: ${fresh.word}`);
      }, () => {});
    } catch { return undefined; }
  }, [active, invitationId, studentId, wordsService]);
  useEffect(() => {
    if (!active || !studentId || !homeworkService.subscribeForLesson) return undefined;
    try {
      return homeworkService.subscribeForLesson({ studentId, invitationId }, (items) => {
        const known = seen.current.homework;
        seen.current.homework = new Set(items.map((item) => item.id));
        if (!known) return;
        const fresh = items.find((item) => !known.has(item.id));
        if (fresh) speak('Õpetaja andis kodutöö. Teeme koos!', `Учитель дал домашку: ${fresh.task}`);
      }, () => {});
    } catch { return undefined; }
  }, [active, homeworkService, invitationId, studentId]);

  if (!pet) return null;
  return (
    <div className="room-pet" aria-live="polite">
      {say ? <div className="room-pet__bubble" role="status"><p>{say.text}</p><small lang="ru">{say.hint}</small></div> : null}
      <button type="button" className="room-pet__art" aria-label={`${pet.name}: peida jutumull`} onClick={() => setSay(null)}>
        <PetArt kind={pet.kind} mood={say ? 'happy' : 'calm'} stage={2} wearing={pet.wearing || {}} />
      </button>
    </div>
  );
}
