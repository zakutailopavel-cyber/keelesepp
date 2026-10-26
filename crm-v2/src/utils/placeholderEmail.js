// Made-up addresses people type to get past a form (123@123.com, test@test.ee, a@a.com): the CRM does not accept them
// and sends nothing there (owner 2026-10-26, a homework e-mail to 123@123.com bounced). Keep in step with
// functions/email-address-core.js.
const FAKE_NAMES = new Set(['test', 'testing', 'example', 'asd', 'asdf', 'qwe', 'qwerty', 'abc', 'aaa', 'xxx', 'xyz', 'fake', 'none', 'no', 'noemail', 'nomail', 'puudub', 'nope', 'domain', 'mail-ei-ole']);
const FAKE_LOCALS = new Set(['noemail', 'nomail', 'no-email', 'puudub', 'none', 'eiole', 'ei-ole', 'nobody']);

export function isPlaceholderEmail(value) {
  const email = String(value ?? '').trim().toLowerCase();
  const at = email.lastIndexOf('@');
  if (at < 1) return false;
  const local = email.slice(0, at);
  const host = email.slice(at + 1);
  const labels = host.split('.');
  const name = labels.length > 1 ? labels[labels.length - 2] : host;
  if (FAKE_LOCALS.has(local)) return true;
  if (/^example\./.test(host) || host === 'example' || labels.includes('example')) return true;
  if (/^\d+$/.test(name) || FAKE_NAMES.has(name)) return true;
  if (/^(.)\1*$/.test(local) && /^(.)\1*$/.test(name) && local[0] === name[0]) return true; // a@a.com, aaa@aa.ee
  return false;
}
