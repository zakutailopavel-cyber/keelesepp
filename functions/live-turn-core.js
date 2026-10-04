"use strict";

// Live Classroom TURN relay (Cloudflare Realtime TURN). The long-term TURN key stays in Secret Manager; a participant of
// an accepted invitation receives short-lived ICE credentials for the call. Pure helpers, unit-tested without network.

const CLOUDFLARE_TURN_API = "https://rtc.live.cloudflare.com/v1/turn/keys";
const TURN_TTL_SECONDS = 4 * 60 * 60; // longer than the longest lesson; the client refreshes before it runs out
const ALLOWED_HOSTS = /^(stun|turns?):(stun|turn)\.cloudflare\.com(:\d+)?(\?transport=(udp|tcp))?$/;

function turnAccessDecision(invitation, uid) {
  if (!invitation) return { allowed: false, status: 404, reason: "Invitation not found" };
  if (!uid || (invitation.teacherUid !== uid && invitation.studentUid !== uid)) {
    return { allowed: false, status: 403, reason: "Not a participant of this lesson" };
  }
  if (invitation.status !== "accepted") return { allowed: false, status: 409, reason: "Lesson room is not open" };
  return { allowed: true };
}

// Keep only Cloudflare STUN/TURN urls and string credentials; anything unexpected is dropped, never passed on.
function sanitizeIceServers(payload) {
  const servers = Array.isArray(payload?.iceServers) ? payload.iceServers : [];
  return servers.map((server) => {
    const urls = (Array.isArray(server?.urls) ? server.urls : [server?.urls])
      .map((url) => String(url || "").trim())
      .filter((url) => ALLOWED_HOSTS.test(url));
    if (!urls.length) return null;
    const entry = { urls };
    if (urls.some((url) => url.startsWith("turn"))) {
      if (typeof server.username !== "string" || typeof server.credential !== "string" || !server.username || !server.credential) return null;
      entry.username = server.username.slice(0, 512);
      entry.credential = server.credential.slice(0, 512);
    }
    return entry;
  }).filter(Boolean);
}

async function fetchCloudflareIceServers({ keyId, apiToken, ttl = TURN_TTL_SECONDS, fetchImpl = globalThis.fetch, timeoutMs = 5000 }) {
  if (!keyId || !apiToken) return { configured: false, iceServers: [], ttl: 0 };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(`${CLOUDFLARE_TURN_API}/${encodeURIComponent(keyId)}/credentials/generate-ice-servers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ttl }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error(`Cloudflare TURN responded ${response.status}`);
      error.status = 502;
      throw error;
    }
    const iceServers = sanitizeIceServers(await response.json());
    if (!iceServers.some((server) => server.username)) {
      const error = new Error("Cloudflare TURN returned no relay credentials");
      error.status = 502;
      throw error;
    }
    return { configured: true, iceServers, ttl };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { TURN_TTL_SECONDS, turnAccessDecision, sanitizeIceServers, fetchCloudflareIceServers };
