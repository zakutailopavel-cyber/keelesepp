"use strict";

// New homework → a short e-mail to the student and to the parent(s) (Estonian + Russian). Pure helpers; the
// Firestore trigger lives in index.js (notifyHomeworkCreated).

const CRM_URL = "https://crm.epkoolitus.ee";
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = value => String(value || "").trim().toLowerCase();

// Only homework given now (today or with a fresh createdAt) is announced: imports and migrations stay silent.
function shouldAnnounceHomework(homework = {}, { today = "", nowMs = Date.now() } = {}) {
  if (!homework.studentId || !String(homework.task || "").trim()) return false;
  if (homework.notify === false || homework.status === "Tehtud") return false;
  const created = Date.parse(homework.createdAt || "");
  if (Number.isFinite(created)) return nowMs - created < 60 * 60 * 1000;
  return Boolean(today) && homework.date === today;
}

// student: the card e-mail + linked student accounts; parents: card parent e-mails + linked parent accounts
function homeworkRecipients(student = {}, { studentAccountEmails = [], parentAccountEmails = [] } = {}) {
  if (student.homeworkEmailOptOut === true) return { student: [], parents: [] };
  const studentEmails = [...new Set([student.email, ...studentAccountEmails].map(clean).filter(e => EMAIL.test(e)))];
  const parentEmails = [...new Set([student.parentEmail, student.guardianEmail, ...parentAccountEmails].map(clean)
    .filter(e => EMAIL.test(e) && !studentEmails.includes(e)))];
  return { student: studentEmails, parents: parentEmails };
}

function composeHomeworkEmail({ homework = {}, student = {}, to, audience = "student" }) {
  const name = student.name || homework.studentName || "";
  const task = String(homework.task || "").trim();
  const due = homework.due ? String(homework.due).slice(0, 10) : "";
  const teacher = homework.teacherName || student.teacher || "";
  const parent = audience === "parent";
  const subject = parent
    ? `Uus kodutöö: ${name} / Новое домашнее задание: ${name}`
    : "Uus kodutöö / Новое домашнее задание";
  const extras = [
    homework.boardPageTitle ? [`Tahvlileht: ${homework.boardPageTitle}`, `Лист доски: ${homework.boardPageTitle}`] : null,
    homework.worksheetTitle ? [`Tööleht: ${homework.worksheetTitle}`, `Рабочий лист: ${homework.worksheetTitle}`] : null,
  ].filter(Boolean);
  const etIntro = parent ? `${name} sai uue kodutöö${teacher ? ` (õpetaja ${teacher})` : ""}.` : `Sul on uus kodutöö${teacher ? ` (õpetaja ${teacher})` : ""}.`;
  const ruIntro = parent ? `${name} получил(а) новое домашнее задание${teacher ? ` (учитель ${teacher})` : ""}.` : `У тебя новое домашнее задание${teacher ? ` (учитель ${teacher})` : ""}.`;
  const etDue = due ? `Tähtaeg: ${due}` : "Tähtaega ei ole";
  const ruDue = due ? `Срок: ${due}` : "Без срока";
  const text = [
    etIntro, task, etDue, ...extras.map(pair => pair[0]), `Ava: ${CRM_URL}/homework`, "",
    ruIntro, task, ruDue, ...extras.map(pair => pair[1]), `Открыть: ${CRM_URL}/homework`, "", "KeeleSepp",
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;color:#1C2B3A;line-height:1.5">
  <p>${esc(etIntro)}<br><span style="color:#64748b">${esc(ruIntro)}</span></p>
  <p style="white-space:pre-line;padding:10px 12px;background:#f8fafc;border-radius:8px;border:1px solid #e5e7eb"><strong>${esc(task)}</strong></p>
  <p>${esc(etDue)} · <span style="color:#64748b">${esc(ruDue)}</span></p>
  ${extras.map(pair => `<p style="margin:4px 0">${esc(pair[0])} · <span style="color:#64748b">${esc(pair[1])}</span></p>`).join("")}
  <p><a href="${CRM_URL}/homework" style="display:inline-block;background:#2F5D50;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700">Ava kodutöö / Открыть</a></p>
  <p style="font-size:12px;color:#64748b">KeeleSepp · info@epkoolitus.ee · +372 5434 4155</p>
</div>`;
  return { to, subject, text, html };
}

module.exports = { shouldAnnounceHomework, homeworkRecipients, composeHomeworkEmail };
