"use strict";

function collectTrustedRoles(profile = {}, decoded = {}) {
  const roles = new Set();
  const addRole = value => {
    if (!value) return;
    if (Array.isArray(value)) {
      value.forEach(addRole);
      return;
    }
    roles.add(String(value).toLowerCase());
  };
  // Firestore security rules protect the canonical profile.role field.
  // Additional profile flags are deliberately ignored because a client-owned
  // profile must never become an authorization source.
  addRole(profile.role);
  // Custom token claims are signed by Firebase Admin and may carry multi-role access.
  addRole(decoded.role);
  addRole(decoded.roles);
  return roles;
}

// Self-registered parents and students start as "pending" and get no access until an administrator
// approves them; "rejected" stays blocked. Accounts without the field (created earlier or by staff) are approved.
const BLOCKED_APPROVAL_STATUSES = new Set(["pending", "rejected"]);

function isPendingApproval(profile = {}) {
  return BLOCKED_APPROVAL_STATUSES.has(profile.approvalStatus);
}

function isDisabledProfile(profile = {}) {
  return profile.disabled === true || isPendingApproval(profile);
}

module.exports = { collectTrustedRoles, isDisabledProfile, isPendingApproval };
