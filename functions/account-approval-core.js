"use strict";

// Admin approval of self-registered accounts (parents and students register themselves on
// crm.epkoolitus.ee/registreeru and wait as "pending"). Pure helpers; routes live in index.js.

const APPROVAL_STATUSES = ["pending", "approved", "rejected"];
const CRM_URL = "https://crm.epkoolitus.ee";
const ROLE_LABEL = { parent: "Lapsevanem", student: "Õpilane" };

const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));

function approvalDecision(decision) {
  if (decision === "approve") return "approved";
  if (decision === "reject") return "rejected";
  throw Object.assign(new Error("Unknown decision"), { status: 400 });
}

function approvalUpdate({ decision, actor, nowIso, reason = "" }) {
  const status = approvalDecision(decision);
  const base = { approvalStatus: status, approvalDecidedAt: nowIso, approvalDecidedBy: actor, updatedAt: nowIso };
  return status === "rejected" ? { ...base, approvalReason: String(reason || "").trim().slice(0, 300) } : base;
}

function composePendingAccountEmail(profile = {}, { to = "info@epkoolitus.ee" } = {}) {
  const rows = [
    ["Nimi", profile.displayName],
    ["E-post", profile.email],
    ["Roll", ROLE_LABEL[profile.role] || profile.role],
    ["Lapse nimi", profile.childName || "—"],
    ["Soovitud õpetaja", profile.preferredTeacher || "—"],
  ];
  const subject = `Uus konto ootab kinnitamist: ${profile.displayName || profile.email}`;
  const text = `${rows.map(([k, v]) => `${k}: ${v || "—"}`).join("\n")}\n\nKinnita või keeldu: ${CRM_URL}/accounts`;
  const html = `<div style="font-family:Arial,sans-serif;color:#1C2B3A">
  <h2 style="margin:0 0 12px">Uus konto ootab kinnitamist</h2>
  <table style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;font-weight:700">${esc(k)}</td><td style="padding:6px 10px;border:1px solid #e5e7eb">${esc(v || "—")}</td></tr>`).join("")}</table>
  <p style="margin-top:16px"><a href="${CRM_URL}/accounts" style="display:inline-block;background:#2F5D50;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700">Ava „Uued kontod”</a></p>
</div>`;
  return { to, subject, text, html };
}

// Sent to the person once the administrator approved the account (Estonian + Russian: most families are Russian-speaking).
function composeApprovedEmail(profile = {}) {
  const name = profile.displayName || "";
  const subject = "Teie KeeleSeppi konto on kinnitatud / Ваш аккаунт KeeleSepp подтверждён";
  const text = `Tere${name ? `, ${name}` : ""}!\nTeie konto on kinnitatud. Logige sisse: ${CRM_URL}/login\n\nЗдравствуйте${name ? `, ${name}` : ""}!\nВаш аккаунт подтверждён. Войти: ${CRM_URL}/login\n\nKeeleSepp`;
  const html = `<div style="font-family:Arial,sans-serif;color:#1C2B3A;line-height:1.5">
  <p>Tere${name ? `, ${esc(name)}` : ""}!<br>Teie KeeleSeppi konto on kinnitatud.</p>
  <p>Здравствуйте${name ? `, ${esc(name)}` : ""}!<br>Ваш аккаунт KeeleSepp подтверждён.</p>
  <p><a href="${CRM_URL}/login" style="display:inline-block;background:#2F5D50;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700">Logi sisse / Войти</a></p>
  <p style="font-size:12px;color:#64748b">KeeleSepp · info@epkoolitus.ee · +372 5434 4155</p>
</div>`;
  return { to: profile.email, subject, text, html };
}

module.exports = { APPROVAL_STATUSES, approvalDecision, approvalUpdate, composePendingAccountEmail, composeApprovedEmail };
