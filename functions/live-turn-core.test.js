"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { fetchCloudflareIceServers, sanitizeIceServers, turnAccessDecision, TURN_TTL_SECONDS } = require("./live-turn-core");

const invitation = { teacherUid: "t1", studentUid: "s1", status: "accepted" };

test("only the teacher and the student of an accepted room get TURN access", () => {
  assert.equal(turnAccessDecision(invitation, "t1").allowed, true);
  assert.equal(turnAccessDecision(invitation, "s1").allowed, true);
  assert.equal(turnAccessDecision(invitation, "parent").status, 403);
  assert.equal(turnAccessDecision(invitation, "").status, 403);
  assert.equal(turnAccessDecision({ ...invitation, status: "pending" }, "s1").status, 409);
  assert.equal(turnAccessDecision({ ...invitation, status: "closed" }, "t1").status, 409);
  assert.equal(turnAccessDecision(null, "t1").status, 404);
});

const cloudflareResponse = {
  iceServers: [
    { urls: ["stun:stun.cloudflare.com:3478"] },
    { urls: ["turn:turn.cloudflare.com:3478?transport=udp", "turns:turn.cloudflare.com:443?transport=tcp", "turn:evil.example.com:3478"], username: "user", credential: "secret" },
  ],
};

test("sanitizes Cloudflare ICE servers and drops foreign hosts or missing credentials", () => {
  assert.deepEqual(sanitizeIceServers(cloudflareResponse), [
    { urls: ["stun:stun.cloudflare.com:3478"] },
    { urls: ["turn:turn.cloudflare.com:3478?transport=udp", "turns:turn.cloudflare.com:443?transport=tcp"], username: "user", credential: "secret" },
  ]);
  assert.deepEqual(sanitizeIceServers({ iceServers: [{ urls: "turn:turn.cloudflare.com:3478" }] }), []);
  assert.deepEqual(sanitizeIceServers({ iceServers: [{ urls: ["turn:evil.example.com:3478"], username: "u", credential: "c" }] }), []);
  assert.deepEqual(sanitizeIceServers(null), []);
});

test("requests short-lived credentials with the key id and token, never returning the token", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return { ok: true, status: 201, json: async () => cloudflareResponse };
  };
  const result = await fetchCloudflareIceServers({ keyId: "key-1", apiToken: "tok", fetchImpl });
  assert.equal(calls[0].url, "https://rtc.live.cloudflare.com/v1/turn/keys/key-1/credentials/generate-ice-servers");
  assert.equal(calls[0].options.headers.Authorization, "Bearer tok");
  assert.deepEqual(JSON.parse(calls[0].options.body), { ttl: TURN_TTL_SECONDS });
  assert.equal(result.configured, true);
  assert.equal(result.ttl, TURN_TTL_SECONDS);
  assert.ok(!JSON.stringify(result).includes("tok\""));
});

test("not configured → empty list; Cloudflare error or no relay → 502", async () => {
  assert.deepEqual(await fetchCloudflareIceServers({ keyId: "", apiToken: "" }), { configured: false, iceServers: [], ttl: 0 });
  await assert.rejects(fetchCloudflareIceServers({ keyId: "k", apiToken: "t", fetchImpl: async () => ({ ok: false, status: 401 }) }), (error) => error.status === 502);
  await assert.rejects(fetchCloudflareIceServers({ keyId: "k", apiToken: "t", fetchImpl: async () => ({ ok: true, json: async () => ({ iceServers: [{ urls: ["stun:stun.cloudflare.com:3478"] }] }) }) }), (error) => error.status === 502);
});
