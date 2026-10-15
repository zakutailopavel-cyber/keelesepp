"use strict";

// „Saada kutse” on the student card (owner, 2026-10-14, Mihhail Smirnov had no login of his own): the administrator
// gives a student an account without a password; the student gets an e-mail with a link where they set the password.
// Pure helpers; the route (/accounts/invite in staffOperationsApi) creates the account and links the card.

const CRM_URL = "https://crm.epkoolitus.ee";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
const fail = (status, message) => Object.assign(new Error(message), { status });

function inviteEmailAddress(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) throw fail(400, "Sisesta õpilase e-posti aadress.");
  return email;
}

// What to do for this card and this e-mail. `existing` is the Firebase account with the e-mail (or null);
// `studentIds` / `parentIds` are the accounts already on the card.
function invitePlan({ student, email, existing = null, studentIds = [], parentIds = [] }) {
  if (!student || student.active === false) throw fail(404, "Aktiivset õpilase kaarti ei leitud.");
  if (existing) {
    if (studentIds.includes(existing.uid)) return { action: "resend", uid: existing.uid };
    if (parentIds.includes(existing.uid)) throw fail(409, "See e-post on selle kaardi lapsevanema konto. Kasuta õpilase enda e-posti.");
    throw fail(409, "Sellel e-postil on juba konto. Seo see konto kaardiga lehel „Kontod”.");
  }
  if (studentIds.length) throw fail(409, "Kaardil on juba õpilase konto. Saada parooli link sellele kontole.");
  return { action: "create" };
}

// Estonian + Russian (most families are Russian-speaking). `link` sets the password and then opens the CRM login.
// `children`: the children a parent account sees (a parent invite)
function composeInviteEmail({ name = "", email, link, resend = false, children = [] }) {
  const subject = resend
    ? "KeeleSepp: määra uus parool / задайте новый пароль"
    : "Sinu KeeleSeppi konto / Ваш аккаунт KeeleSepp";
  const etLead = resend ? "Siin on link uue parooli määramiseks." : "Sulle on loodud KeeleSeppi konto. Määra endale parool:";
  const ruLead = resend ? "Ссылка, чтобы задать новый пароль." : "Для вас создан аккаунт KeeleSepp. Задайте пароль:";
  const kids = children.filter(Boolean).join(", ");
  const text = `Tere${name ? `, ${name}` : ""}!\n${etLead}\n${link}\nKasutajanimi: ${email}\n${kids ? `Lapsed: ${kids}\n` : ""}Seejärel logi sisse: ${CRM_URL}/login\n\n`
    + `Здравствуйте${name ? `, ${name}` : ""}!\n${ruLead}\n${link}\nЛогин: ${email}\n${kids ? `Дети: ${kids}\n` : ""}Потом войдите: ${CRM_URL}/login\n\nKeeleSepp`;
  const html = `<div style="font-family:Arial,sans-serif;color:#1C2B3A;line-height:1.5">
  <p>Tere${name ? `, ${esc(name)}` : ""}!<br>${esc(etLead)}</p>
  <p>Здравствуйте${name ? `, ${esc(name)}` : ""}!<br>${esc(ruLead)}</p>
  <p><a href="${esc(link)}" style="display:inline-block;background:#2F5D50;color:#fff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700">Määra parool / Задать пароль</a></p>
  <p>Kasutajanimi / Логин: <strong>${esc(email)}</strong><br>${kids ? `Lapsed / Дети: ${esc(kids)}<br>` : ""}Sisselogimine / Вход: <a href="${CRM_URL}/login">${CRM_URL}/login</a></p>
  <p style="font-size:12px;color:#64748b">KeeleSepp · info@epkoolitus.ee · +372 5434 4155</p>
</div>`;
  return { to: email, subject, text, html };
}

module.exports = { CRM_URL, inviteEmailAddress, invitePlan, composeInviteEmail };
