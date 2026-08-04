import { invoiceBalanceCents } from '../students/studentFinance.js';
import { parentReviewKey, splitChildNames } from '../../services/firebase/parents.js';

const normalize = (value) => String(value || '').trim().toLocaleLowerCase('et');

export function parentMatchesStudent(parent, student) {
  const linkedParentId = student.linkedParentId || student.parentUid || student.guardianUid || '';
  if (linkedParentId && linkedParentId === parent.id) return true;
  const parentEmail = normalize(parent.email);
  const studentParentEmail = normalize(student.parentEmail || student.contactEmail || student.guardianEmail);
  if (parentEmail && studentParentEmail && parentEmail === studentParentEmail) return true;
  const requestedNames = splitChildNames(parent.childName).map(normalize);
  const studentParentName = normalize(student.parentName || student.guardianName);
  return Boolean(requestedNames.includes(normalize(student.name)) && normalize(parent.displayName) && normalize(parent.displayName) === studentParentName);
}

export function invoiceMatchesParent(invoice, parent, children = []) {
  const parentIds = [invoice.parentUid, invoice.linkedParentId, invoice.guardianUid].filter(Boolean);
  if (parentIds.includes(parent.id)) return true;
  const parentEmail = normalize(parent.email);
  if (parentEmail && [invoice.parentEmailLower, invoice.payerEmailLower, invoice.parentEmail, invoice.payerEmail].some((value) => normalize(value) === parentEmail)) return true;
  return children.some((student) => invoice.studentId === student.id || (normalize(invoice.studentName) && normalize(invoice.studentName) === normalize(student.name)));
}

export function buildParentRows(parents = [], students = [], invoices = []) {
  return parents.map((parent) => {
    const children = students.filter((student) => student.active !== false && !student.convertedToParent && parentMatchesStudent(parent, student));
    const requestedNames = splitChildNames(parent.childName);
    const linkedNames = new Set(children.map((student) => normalize(student.name)));
    const missingNames = requestedNames.filter((name) => !linkedNames.has(normalize(name)));
    const parentInvoices = invoices.filter((invoice) => invoiceMatchesParent(invoice, parent, children));
    return {
      parent,
      children,
      requestedNames,
      missingNames,
      needsReview: Boolean(requestedNames.length && (parent.parentReviewStatus !== 'checked' || parent.parentReviewKey !== parentReviewKey(parent.childName))),
      invoices: parentInvoices,
      balanceCents: parentInvoices.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0),
    };
  });
}

export function filterParentRows(rows, { query = '', status = 'all' } = {}) {
  const needle = normalize(query);
  return rows.filter((row) => {
    if (status !== 'all' && row.parent.parentContactStatus !== status) return false;
    if (!needle) return true;
    return [row.parent.displayName, row.parent.email, row.parent.phone, row.parent.parentContactOwner, row.parent.parentContactNotes, ...row.requestedNames, ...row.children.map((child) => `${child.name} ${child.teacher} ${child.subject}`)]
      .some((value) => normalize(value).includes(needle));
  });
}
