const crypto = require("crypto");

const CHANNELS = new Set(["facebook", "instagram"]);

function clean(value, maxLength = 4000) {
  return String(value || "").trim().slice(0, maxLength);
}

function messageDocumentId(channel, externalMessageId) {
  return `meta-${crypto.createHash("sha256").update(`${channel}:${externalMessageId}`).digest("hex").slice(0, 40)}`;
}

function verifyMetaSignature({ rawBody, signature, appSecret }) {
  if (!appSecret || !signature || !Buffer.isBuffer(rawBody)) return false;
  const match = String(signature).match(/^sha256=([a-f0-9]{64})$/i);
  if (!match) return false;
  const expected = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const actual = match[1].toLowerCase();
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(actual, "hex"));
}

function webhookMessages(body = {}) {
  const channel = body.object === "instagram" ? "instagram" : body.object === "page" ? "facebook" : "";
  if (!CHANNELS.has(channel) || !Array.isArray(body.entry)) return [];
  const messages = [];
  body.entry.forEach(entry => {
    (entry.messaging || []).forEach(event => {
      const externalMessageId = clean(event.message?.mid, 500);
      const text = clean(event.message?.text);
      const externalSenderId = clean(event.sender?.id, 300);
      if (!externalMessageId || !externalSenderId || !text || event.message?.is_echo) return;
      const createdAt = new Date(Number(event.timestamp) || Date.now()).toISOString();
      messages.push({
        id: messageDocumentId(channel, externalMessageId),
        channel,
        conversationId: `${channel}:${externalSenderId}`,
        externalThreadId: externalSenderId,
        externalMessageId,
        externalSenderId,
        externalSenderName: channel === "instagram" ? "Instagrami kasutaja" : "Facebooki kasutaja",
        studentId: "",
        studentName: channel === "instagram" ? "Instagrami vestlus" : "Facebooki vestlus",
        teacher: "",
        text,
        fromUid: externalSenderId,
        fromName: channel === "instagram" ? "Instagrami kasutaja" : "Facebooki kasutaja",
        fromRole: "external",
        createdAt,
        date: createdAt.slice(0, 10),
        read: false,
        provider: "meta",
      });
    });
  });
  return messages;
}

function replyInput(body = {}) {
  const channel = clean(body.channel, 32).toLowerCase();
  const recipientId = clean(body.recipientId || body.externalSenderId, 300);
  const conversationId = clean(body.conversationId, 500);
  const text = clean(body.text);
  if (!CHANNELS.has(channel)) throw new Error("Unsupported Meta channel");
  if (!recipientId || !conversationId) throw new Error("Meta recipient and conversation are required");
  if (!text) throw new Error("Reply text is required");
  if (text.length > 2000) throw new Error("Meta reply may be up to 2000 characters");
  return { channel, recipientId, conversationId, text };
}

function replyMatchesConversation(message = {}, input = {}) {
  return message.provider === "meta"
    && message.fromRole === "external"
    && message.channel === input.channel
    && message.conversationId === input.conversationId
    && message.externalSenderId === input.recipientId;
}

function metaSendRequest({
  channel,
  recipientId,
  text,
  pageId,
  graphVersion = "v25.0",
} = {}) {
  if (!CHANNELS.has(channel)) throw new Error("Unsupported Meta channel");
  const senderPageId = clean(pageId, 300);
  const version = clean(graphVersion, 32).replace(/^\/+|\/+$/g, "");
  if (!senderPageId) throw new Error("Meta Page ID is required");
  if (!/^v\d+\.\d+$/.test(version)) throw new Error("Invalid Meta Graph API version");

  const body = {
    recipient: { id: recipientId },
    message: { text },
  };
  if (channel === "facebook") body.messaging_type = "RESPONSE";

  return {
    url: `https://graph.facebook.com/${version}/${encodeURIComponent(senderPageId)}/messages`,
    body,
  };
}

module.exports = {
  messageDocumentId,
  metaSendRequest,
  replyInput,
  replyMatchesConversation,
  verifyMetaSignature,
  webhookMessages,
};
