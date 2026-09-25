const assert = require("node:assert/strict");
const crypto = require("crypto");
const test = require("node:test");
const {
  messageDocumentId,
  metaSendRequest,
  replyInput,
  replyMatchesConversation,
  verifyMetaSignature,
  webhookMessages,
} = require("./meta-messaging-core");

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


test("binds replies only to the exact signed Meta conversation", () => {
  const input = replyInput({
    channel: "facebook",
    recipientId: "psid-1",
    conversationId: "facebook:psid-1",
    text: "Tere!",
  });
  assert.equal(replyMatchesConversation({
    provider: "meta",
    fromRole: "external",
    channel: "facebook",
    conversationId: "facebook:psid-1",
    externalSenderId: "psid-1",
  }, input), true);
  assert.equal(replyMatchesConversation({
    provider: "meta",
    fromRole: "external",
    channel: "facebook",
    conversationId: "facebook:psid-1",
    externalSenderId: "different-recipient",
  }, input), false);
  assert.equal(replyMatchesConversation({
    provider: "meta",
    fromRole: "admin",
    channel: "facebook",
    conversationId: "facebook:psid-1",
    externalSenderId: "psid-1",
  }, input), false);
});

test("builds channel-specific Meta send requests", () => {
  const facebook = metaSendRequest({
    channel: "facebook",
    recipientId: "psid-1",
    text: "Tere!",
    facebookPageId: "571647362697524",
    instagramAccountId: "17841474277841669",
  });
  assert.equal(facebook.url, "https://graph.facebook.com/v26.0/571647362697524/messages");
  assert.equal(facebook.tokenEnv, "META_PAGE_ACCESS_TOKEN");
  assert.equal(facebook.body.messaging_type, "RESPONSE");
  assert.deepEqual(facebook.body.recipient, { id: "psid-1" });

  const instagram = metaSendRequest({
    channel: "instagram",
    recipientId: "igsid-1",
    text: "Tere IG!",
    facebookPageId: "571647362697524",
    instagramAccountId: "17841474277841669",
  });
  assert.equal(instagram.url, "https://graph.instagram.com/v26.0/17841474277841669/messages");
  assert.equal(instagram.tokenEnv, "META_INSTAGRAM_ACCESS_TOKEN");
  assert.equal(instagram.body.messaging_type, undefined);
  assert.deepEqual(instagram.body.recipient, { id: "igsid-1" });
});
