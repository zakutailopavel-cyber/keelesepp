"use strict";

const CRM_VERCEL_ORIGIN = /^https:\/\/keelesepp-crm-v2(?:-[a-z0-9-]+)?-zakutailopavel-cybers-projects\.vercel\.app$/;

function originAllowed(origin, exactOrigins = []) {
  const value = String(origin || "").trim().toLowerCase();
  if (!value) return false;
  if ((Array.isArray(exactOrigins) ? exactOrigins : []).some(item => String(item || "").trim().toLowerCase() === value)) return true;
  return CRM_VERCEL_ORIGIN.test(value);
}

module.exports = { CRM_VERCEL_ORIGIN, originAllowed };
