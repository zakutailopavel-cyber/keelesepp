function timeValue(message) {
  return String(message.createdAt || message.date || '');
}

export function buildConversations(messages = [], userUid = '', locallyRead = new Set()) {
  const map = new Map();
  [...messages].sort((a, b) => timeValue(a).localeCompare(timeValue(b))).forEach((message) => {
    const id = message.studentId || message.studentName;
    if (!id) return;
    const previous = map.get(id) || { id, name: message.studentName || 'Vestlus', teacher: message.teacher || '', messages: [], unread: 0, lastAt: '' };
    previous.messages.push(message);
    previous.teacher ||= message.teacher || '';
    previous.lastAt = timeValue(message);
    if (!message.read && message.fromUid !== userUid && !locallyRead.has(message.id)) previous.unread += 1;
    map.set(id, previous);
  });
  return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}
