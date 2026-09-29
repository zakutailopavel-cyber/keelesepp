"use strict";

// Course enquiries from the public website (www.epkoolitus.ee, form "Registreeru kursusele").
// Before this the form opened the visitor's mail app (mailto:), so enquiries were silently lost
// on phones and webmail. Pure helpers here; the HTTP endpoint lives in index.js (websiteLeadApi).

const LANGUAGES = ["Eesti keel", "Inglise keel"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "Ei tea oma taset", "Eratunnid", "Määramata"];
const SITE_LOCALES = ["et", "ru", "en"];
const MAX_PER_HOUR = 5;

const clean = (value, max) => String(value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);

function normalizeWebsiteLead(body = {}) {
  // bots fill every field; people never see this one
  if (clean(body.website, 200)) return { spam: true };
  const lead = {
    name: clean(body.name, 120),
    email: clean(body.email, 200).toLowerCase(),
    phone: clean(body.phone, 40),
    language: clean(body.language, 40),
    level: clean(body.level, 40) || "Määramata",
    message: clean(body.message, 2000),
    locale: SITE_LOCALES.includes(body.locale) ? body.locale : "et",
    page: clean(body.page, 200),
  };
  const errors = [];
  if (lead.name.length < 2) errors.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) errors.push("email");
  if (lead.phone && lead.phone.replace(/\D/g, "").length < 5) errors.push("phone");
  if (!LANGUAGES.includes(lead.language)) errors.push("language");
  if (!LEVELS.includes(lead.level)) lead.level = "Määramata";
  return errors.length ? { errors } : { lead };
}

function throttleAllows(recentTimestamps = [], nowMs = Date.now()) {
  const hourAgo = nowMs - 60 * 60 * 1000;
  return recentTimestamps.filter(ts => ts > hourAgo).length < MAX_PER_HOUR;
}

const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

function composeWebsiteLeadEmail(lead, { to = "info@epkoolitus.ee" } = {}) {
  const rows = [
    ["Nimi", lead.name],
    ["E-post", lead.email],
    ["Telefon", lead.phone || "—"],
    ["Keel", lead.language],
    ["Tase", lead.level],
    ["Lehe keel", lead.locale.toUpperCase()],
    ["Lisainfo", lead.message || "—"],
  ];
  const subject = `Uus päring kodulehelt: ${lead.language} ${lead.level} — ${lead.name}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<div style="font-family:Arial,sans-serif;color:#1C2B3A">
  <h2 style="margin:0 0 12px">Uus päring kodulehelt</h2>
  <table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;font-weight:700">${esc(k)}</td><td style="padding:6px 10px;border:1px solid #e5e7eb;white-space:pre-wrap">${esc(v)}</td></tr>`).join("")}</table>
  <p style="font-size:12px;color:#64748b">Vasta otse sellele kirjale — vastus läheb aadressile ${esc(lead.email)}.</p>
</div>`;
  return { to, subject, text, html, replyTo: lead.email };
}

module.exports = { normalizeWebsiteLead, throttleAllows, composeWebsiteLeadEmail, MAX_PER_HOUR };
