"use strict";

// Course enquiries from the public website (www.epkoolitus.ee, form "Registreeru kursusele").
// Before this the form opened the visitor's mail app (mailto:), so enquiries were silently lost
// on phones and webmail. Pure helpers here; the HTTP endpoint lives in index.js (websiteLeadApi).

const LANGUAGES = ["Eesti keel", "Inglise keel"];
// the „Sobivad ajad” page (owner 2026-10-20): any subject the school teaches
const POLL_SUBJECTS = ["Eesti keel", "Inglise keel", "Matemaatika", "Muu"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FORMATS = ["online", "kohapeal", "mõlemad"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "Ei tea oma taset", "Eratunnid", "Määramata"];
const SITE_LOCALES = ["et", "ru", "en"];
const SOURCES = ["website-registration", "level-test", "availability"];
const SKILLS = ["grammar", "vocabulary", "reading"];
const MAX_PER_HOUR = 5;

const clean = (value, max) => String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);

function normalizeWebsiteLead(body = {}) {
  // bots fill every field; people never see this one
  if (clean(body.website, 200)) return { spam: true };
  const lead = {
    name: clean(body.name, 120),
    ...(body.source === "availability" ? { parentName: clean(body.parentName, 120) } : {}),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 40),
    language: clean(body.language, 40),
    level: clean(body.level, 40) || "Määramata",
    message: clean(body.message, 2000),
    locale: SITE_LOCALES.includes(body.locale) ? body.locale : "et",
    page: clean(body.page, 200),
    source: SOURCES.includes(body.source) ? body.source : "website-registration",
  };
  if (lead.source === "level-test") {
    const score = Number(body.assessment?.score);
    const answered = Number(body.assessment?.answered);
    lead.assessment = {
      diagnosticId: clean(body.assessment?.diagnosticId, 80),
      score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
      answered: Number.isFinite(answered) ? Math.max(0, Math.min(50, Math.round(answered))) : 0,
      skills: Object.fromEntries(SKILLS.map(skill => [skill, Math.max(0, Math.min(100, Math.round(Number(body.assessment?.skills?.[skill]) || 0)))])),
    };
  }
  if (lead.source === "availability") {
    // the times that really suit the learner: "Mon-16:00" (a 30-minute step), and the preferred ones among them
    const slot = (value) => { const text = clean(value, 12); const [day, time] = text.split("-"); return DAYS.includes(day) && /^([01]\d|2[0-3]):(00|30)$/.test(time || "") ? text : ""; };
    const list = (value) => [...new Set((Array.isArray(value) ? value : []).slice(0, 7 * 48).map(slot).filter(Boolean))];
    lead.slots = list(body.slots);
    lead.preferred = list(body.preferred).filter((item) => lead.slots.includes(item));
    if (FORMATS.includes(body.format)) lead.format = body.format;
    if (Number(body.lessonsPerWeek) > 0) lead.lessonsPerWeek = Math.max(1, Math.min(7, Math.round(Number(body.lessonsPerWeek))));
  }
  const errors = [];
  if (lead.name.length < 2) errors.push("name");
  // „Sobivad ajad”: the student's and the parent's first and last name (owner 2026-10-20)
  const fullName = (value) => String(value || "").split(/\s+/).filter((part) => part.length >= 2).length >= 2;
  if (lead.source === "availability" && lead.name.length >= 2 && !fullName(lead.name)) errors.push("name");
  if (lead.source === "availability" && !fullName(lead.parentName)) errors.push("parentName");
  // the availability page asks for an e-mail or a phone (a learner often has only a phone)
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email);
  if (lead.source === "availability" ? (!emailOk && lead.phone.replace(/\D/g, "").length < 5) || (lead.email && !emailOk) : !emailOk) errors.push("email");
  if (lead.phone && lead.phone.replace(/\D/g, "").length < 5) errors.push("phone");
  // the availability page is for current students: no subject asked (the school knows it)
  if (lead.source === "availability" ? lead.language && !POLL_SUBJECTS.includes(lead.language) : !LANGUAGES.includes(lead.language)) errors.push("language");
  if (lead.source === "availability" && lead.slots.length < 1) errors.push("slots");
  if (!LEVELS.includes(lead.level)) lead.level = "Määramata";
  return errors.length ? { errors } : { lead };
}

const DAY_NAMES = { Mon: "E", Tue: "T", Wed: "K", Thu: "N", Fri: "R", Sat: "L", Sun: "P" };
const minutesOf = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const clock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
// "E 16:00–19:00 (★ 17:00–18:00); K 10:00–12:00": the half hours of each day joined into ranges
function slotSummary(slots = [], preferred = []) {
  const ranges = (list) => {
    const out = [];
    list.sort((a, b) => a - b).forEach((start) => { const last = out[out.length - 1]; if (last && last[1] === start) last[1] = start + 30; else out.push([start, start + 30]); });
    return out.map(([from, to]) => `${clock(from)}–${clock(to)}`).join(", ");
  };
  return DAYS.map((day) => {
    const mine = slots.filter((slot) => slot.startsWith(`${day}-`)).map((slot) => minutesOf(slot.slice(4)));
    if (!mine.length) return "";
    const star = preferred.filter((slot) => slot.startsWith(`${day}-`)).map((slot) => minutesOf(slot.slice(4)));
    return `${DAY_NAMES[day]} ${ranges(mine)}${star.length ? ` (★ ${ranges(star)})` : ""}`;
  }).filter(Boolean).join("; ") || "—";
}

function throttleAllows(recentTimestamps = [], nowMs = Date.now()) {
  const hourAgo = nowMs - 60 * 60 * 1000;
  return recentTimestamps.filter(ts => ts > hourAgo).length < MAX_PER_HOUR;
}

const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

function composeWebsiteLeadEmail(lead, { to = "info@epkoolitus.ee" } = {}) {
  const rows = [
    [lead.source === "availability" ? "Õpilane" : "Nimi", lead.name],
    ...(lead.parentName ? [["Lapsevanem", lead.parentName]] : []),
    ["E-post", lead.email],
    ["Telefon", lead.phone || "—"],
    ...(lead.language ? [["Keel", lead.language]] : []),
    ...(lead.source === "availability" ? [] : [["Tase", lead.level]]),
    ["Allikas", lead.source === "level-test" ? "Tasemetest" : lead.source === "availability" ? "Sobivad ajad" : "Kodulehe registreerimisvorm"],
    ...(lead.source === "availability" ? [
      ...(lead.lessonsPerWeek ? [["Tunde nädalas", String(lead.lessonsPerWeek)]] : []),
      ...(lead.format ? [["Vorm", lead.format]] : []),
      ["Sobivad ajad", slotSummary(lead.slots, lead.preferred)],
    ] : []),
    ...(lead.assessment ? [
      ["Diagnostika", lead.assessment.diagnosticId || "—"],
      ["Tulemus", `${lead.assessment.score}/100 (${lead.assessment.answered} vastust)`],
      ["Oskused", Object.entries(lead.assessment.skills).map(([skill, score]) => `${skill}: ${score}%`).join(", ")],
    ] : []),
    ["Lehe keel", lead.locale.toUpperCase()],
    ["Lisainfo", lead.message || "—"],
  ];
  const subject = lead.source === "availability" ? `Sobivad ajad: ${lead.name}${lead.language ? ` (${lead.language})` : ""}` : `Uus päring kodulehelt: ${lead.language} ${lead.level} — ${lead.name}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<div style="font-family:Arial,sans-serif;color:#1C2B3A">
  <h2 style="margin:0 0 12px">Uus päring kodulehelt</h2>
  <table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;font-weight:700">${esc(k)}</td><td style="padding:6px 10px;border:1px solid #e5e7eb;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>
  <p style="font-size:12px;color:#64748b">Vasta otse sellele kirjale — vastus läheb aadressile ${esc(lead.email)}.</p>
</div>`;
  return { to, subject, text, html, ...(lead.email ? { replyTo: lead.email } : {}) };
}

module.exports = { slotSummary, normalizeWebsiteLead, throttleAllows, composeWebsiteLeadEmail, MAX_PER_HOUR };
