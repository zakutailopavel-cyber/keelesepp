const test = require("node:test");
const assert = require("node:assert/strict");
const { runTokenSyncWithRetry, tokenSyncErrorRetryable, tokenSyncFailureRecord } = require("./lesson-tokens-retry-core");

const httpError = (status, message) => Object.assign(new Error(message), { status });

test("a ledger decision (4xx) is not retried, a busy database is", () => {
  assert.equal(tokenSyncErrorRetryable(httpError(409, "period closed")), false);
  assert.equal(tokenSyncErrorRetryable(httpError(403, "another teacher")), false);
  assert.equal(tokenSyncErrorRetryable(httpError(500, "boom")), true);
  assert.equal(tokenSyncErrorRetryable(Object.assign(new Error("contention"), { code: 10 })), true);
  assert.equal(tokenSyncErrorRetryable(Object.assign(new Error("unavailable"), { code: 14 })), true);
  assert.equal(tokenSyncErrorRetryable(new TypeError("x is not a function")), false);
});

test("a temporary error is tried again and then succeeds", async () => {
  const slept = [];
  let calls = 0;
  const result = await runTokenSyncWithRetry(async () => {
    calls += 1;
    if (calls < 3) throw Object.assign(new Error("contention"), { code: 10 });
    return "done";
  }, { delays: [1, 2], sleep: async (ms) => { slept.push(ms); } });
  assert.equal(result, "done");
  assert.equal(calls, 3);
  assert.deepEqual(slept, [1, 2]);
});

test("after the last try the error comes out; a permanent error comes out at once", async () => {
  let calls = 0;
  await assert.rejects(runTokenSyncWithRetry(async () => { calls += 1; throw Object.assign(new Error("unavailable"), { code: 14 }); }, { delays: [1, 2], sleep: async () => {} }), /unavailable/);
  assert.equal(calls, 3);
  calls = 0;
  await assert.rejects(runTokenSyncWithRetry(async () => { calls += 1; throw httpError(409, "period closed"); }, { delays: [1, 2], sleep: async () => {} }), /period closed/);
  assert.equal(calls, 1);
});

test("the „Vead” record has the shape of a browser report and no names", () => {
  const { id, data } = tokenSyncFailureRecord({ lessonId: "abc/1 2", error: httpError(409, "Financial period\n is closed") });
  assert.equal(id, "lesson-tokens-abc_1_2");
  assert.deepEqual(Object.keys(data).sort(), ["browser", "build", "fingerprint", "frame", "kind", "message", "role", "route", "status", "uid"]);
  assert.match(data.message, /Financial period is closed$/);
  assert.equal(data.kind, "call");
  assert.match(data.route, /^\/[^?#]*$/);
  assert.match(data.fingerprint, /^[0-9a-f]{16}$/);
  assert.equal(data.frame, "lessons/abc/1 2");
  // the same reason on another lesson falls into the same group
  assert.equal(tokenSyncFailureRecord({ lessonId: "other", error: httpError(409, "Financial period is closed") }).data.fingerprint, data.fingerprint);
  assert.ok(tokenSyncFailureRecord({ lessonId: "x", error: new Error("y".repeat(900)) }).data.message.length <= 500);
});
