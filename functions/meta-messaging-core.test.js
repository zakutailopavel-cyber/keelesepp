const assert = require("node:assert/strict");
const crypto = require("crypto");
const test = require("node:test");
const { messageDocumentId, replyInput, verifyMetaSignature, webhookMessages } = require("./meta-messaging-core");

test("validates Meta sha256 signatures against the raw request body", () => {
  const rawBody = Buffer.from('{"object":"page"}');
  const signature = `sha256=${crypto.createHmac("sha256", "secret").update(rawBody).digest("hex")}`;
  assert.equal(verifyMetaSignature({ rawBody, signature, appSecret: "secret" }), true);
  assert.equal(verifyMetaSignature({ rawBody, signature, appSecret: "wrong" }), false);
});

test("projects Messenger webhook messages into stable Firestore records", () => {
  const body = { object: "page", entry: [{ messaging: [{ sender: { id: "sender-1" }, message: { mid: "mid.1", text: " Tere! " }, timestamp: 1780000000000 }] }] };
  const [message] = webhookMessages(body);
  assert.equal(message.id, messageDocumentId("facebook", "mid.1"));
  assert.equal(message.channel, "facebook");
  assert.equal(message.conversationId, "facebook:sender-1");
  assert.equal(message.externalSenderId, "sender-1");
  assert.equal(message.text, "Tere!");
  assert.equal(message.read, false);
});

test("ignores echoes and unsupported webhook objects", () => {
  assert.deepEqual(webhookMessages({ object: "unknown", entry: [] }), []);
  assert.deepEqual(webhookMessages({ object: "instagram", entry: [{ messaging: [{ sender: { id: "sender-1" }, message: { mid: "mid.1", text: "echo", is_echo: true } }] }] }), []);
});

test("validates an external reply without accepting oversized text", () => {
  assert.deepEqual(replyInput({ channel: "instagram", recipientId: "ig-1", conversationId: "instagram:ig-1", text: " Tere! " }), {
    channel: "instagram", recipientId: "ig-1", conversationId: "instagram:ig-1", text: "Tere!",
  });
  assert.throws(() => replyInput({ channel: "facebook", recipientId: "fb-1", conversationId: "facebook:fb-1", text: "x".repeat(2001) }), /2000/);
});
