function timeValue(message) {
  return String(message.createdAt || message.date || '');
}

function clean(value) {
  return String(value || '').trim();
}

export function messageChannel(message = {}) {
  const raw = clean(message.channel || message.source).toLocaleLowerCase('en');
  if (raw === 'facebook' || raw === 'messenger' || raw === 'facebook_messenger') return 'facebook';
  if (raw === 'instagram' || raw === 'instagram_direct' || raw === 'ig') return 'instagram';
  return 'internal';
}

export function conversationIdentity(message = {}) {
  const explicit = clean(message.conversationId);
  if (explicit) return explicit;

  const channel = messageChannel(message);
  const studentId = clean(message.studentId);
  if (channel === 'internal' && studentId) return studentId;

  const externalThreadId = clean(message.externalThreadId);
  if (externalThreadId) return `${channel}:${externalThreadId}`;
  if (studentId) return `${channel}:student:${studentId}`;

  const legacyName = clean(message.studentName).toLocaleLowerCase('et');
  if (legacyName) return `legacy:${legacyName}`;

  const messageId = clean(message.id);
  return messageId ? `${channel}:message:${messageId}` : '';
}

export function buildConversations(messages = [], userUid = '', locallyRead = new Set()) {
  const map = new Map();
  [...messages].sort((a, b) => timeValue(a).localeCompare(timeValue(b))).forEach((message) => {
    const id = conversationIdentity(message);
    if (!id) return;

    const channel = messageChannel(message);
    const previous = map.get(id) || {
      id,
      channel,
      studentId: clean(message.studentId),
      externalThreadId: clean(message.externalThreadId),
      name: message.studentName || message.externalSenderName || message.fromName || 'Vestlus',
      teacher: message.teacher || '',
      messages: [],
      unread: 0,
      lastAt: '',
    };

    previous.messages.push(message);
    previous.teacher ||= message.teacher || '';
    previous.studentId ||= clean(message.studentId);
    previous.externalThreadId ||= clean(message.externalThreadId);
    previous.lastAt = timeValue(message);
    if (!message.read && message.fromUid !== userUid && !locallyRead.has(message.id)) previous.unread += 1;
    map.set(id, previous);
  });
  return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}
