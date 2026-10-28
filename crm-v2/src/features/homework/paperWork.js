// A work done on paper (owner 2026-10-28: a pupil's exam writing checked by hand „нужно внедрять и корректировать ее
// оценку в профиле”): the teacher enters the points per criterion, the work is stored as an exerciseResults record
// (exerciseType 'paper', staff may create it under the rules) and checked in the usual review window. The skills the
// points measure move the skill map half way to the measured percent (skillGrades.js `measured`), other skills by grade.
import { suggestedGrade } from './reviewTemplates.js';

export const PAPER_TEMPLATES = [
  {
    id: 'pk-b1-writing',
    title: 'Põhikooli lõpueksam · kirjutamine',
    note: 'Eesti keel teise keelena, B1. Mõlemas ülesandes: ülesande täitmine ja sisu 0–5, keelekasutus 0–5.',
    skills: ['Kirjutamine'],
    parts: [
      { label: '1. ülesanne (teade) · ülesande täitmine ja sisu', max: 5 },
      { label: '1. ülesanne (teade) · keelekasutus', max: 5 },
      { label: '2. ülesanne (kiri) · ülesande täitmine ja sisu', max: 5 },
      { label: '2. ülesanne (kiri) · keelekasutus', max: 5 },
    ],
  },
  {
    id: 'free',
    title: 'Paberil töö',
    note: 'Oma töö: kirjuta osad ja maksimumpunktid ise.',
    skills: [],
    parts: [{ label: 'Kogu töö', max: 10 }],
  },
];

export const templateById = (id) => PAPER_TEMPLATES.find((item) => item.id === id) || PAPER_TEMPLATES[PAPER_TEMPLATES.length - 1];

const number = (value) => (value === '' || value == null ? NaN : Number(String(value).replace(',', '.')));

// the form → the record to store; throws with a message the teacher can act on
export function paperWorkPayload({ student, title, date, parts = [], skills = [], note = '', user }) {
  if (!student?.id) throw new Error('Õpilase kaarti ei leitud.');
  const name = String(title || '').trim().slice(0, 200);
  if (!name) throw new Error('Kirjuta töö nimi.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) throw new Error('Vali kuupäev.');
  const clean = parts.map((part) => ({ label: String(part.label || '').trim().slice(0, 160), points: number(part.points), max: number(part.max) }))
    .filter((part) => part.label || Number.isFinite(part.points));
  if (!clean.length) throw new Error('Lisa vähemalt üks osa punktidega.');
  for (const part of clean) {
    if (!part.label) throw new Error('Igal osal peab olema nimi.');
    if (!Number.isFinite(part.max) || part.max <= 0) throw new Error(`„${part.label}”: maksimum peab olema suurem kui 0.`);
    if (!Number.isFinite(part.points) || part.points < 0 || part.points > part.max) throw new Error(`„${part.label}”: punktid 0–${part.max}.`);
  }
  const correct = clean.reduce((sum, part) => sum + part.points, 0);
  const total = clean.reduce((sum, part) => sum + part.max, 0);
  const createdAt = new Date().toISOString();
  return {
    studentId: student.id,
    studentName: student.name || '',
    exerciseId: '',
    exerciseTitle: name,
    exerciseType: 'paper',
    paperParts: clean,
    paperSkills: [...new Set(skills.filter(Boolean))],
    paperNote: String(note || '').trim().slice(0, 1000),
    score: { correct, total },
    pct: Math.round((correct / total) * 100),
    result: {},
    completedAt: `${date}T12:00:00.000Z`,
    createdAt,
    completedBy: user?.uid || '',
    reviewStatus: 'pending',
  };
}

// the skills a paper work measured: { skill: percent } and the grades they start with in the review window
export function paperMeasured(submission = {}) {
  const data = submission.source || {};
  if (data.exerciseType !== 'paper' || submission.percentage == null) return {};
  return Object.fromEntries((data.paperSkills || []).map((skill) => [skill, submission.percentage]));
}
export function paperStartGrades(submission = {}) {
  const grade = suggestedGrade(submission.percentage);
  return grade ? Object.fromEntries(Object.keys(paperMeasured(submission)).map((skill) => [skill, grade])) : {};
}
