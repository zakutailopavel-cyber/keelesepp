import { dashboardFallback } from '../data/dashboard.js';

const requiredKeys = ['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_PROJECT_ID'];

export function hasFirebaseConfig(env = import.meta.env) {
  return requiredKeys.every((key) => Boolean(env[key]));
}

export async function loadDashboardData() {
  if (!hasFirebaseConfig()) {
    return { source: 'fallback', data: dashboardFallback };
  }

  // Firebase integration will live behind this adapter so UI components remain
  // independent from the legacy compat SDK and collection structure.
  return { source: 'fallback', data: dashboardFallback };
}
