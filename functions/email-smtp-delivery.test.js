'use strict';
// deliverEmail with the real nodemailer against a small SMTP server on 127.0.0.1. Invoices depend on this path, and
// the other tests replace nodemailer with a stub, so a nodemailer upgrade would otherwise go through untested.
const test = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const rewire = require('rewire');
const api = rewire('./index.js');

function startSmtpSink() {
  const commands = [];
  const messages = [];
  const server = net.createServer((socket) => {
    let inData = false;
    let buffer = '';
    socket.write('220 sink ESMTP\r\n');
    socket.on('error', () => {});
    socket.on('data', (chunk) => {
      buffer += chunk.toString('latin1');
      for (;;) {
        if (inData) {
          const end = buffer.indexOf('\r\n.\r\n');
          if (end < 0) return;
          messages.push(buffer.slice(0, end));
          buffer = buffer.slice(end + 5);
          inData = false;
          socket.write('250 2.0.0 Ok queued\r\n');
        }
        const lineEnd = buffer.indexOf('\r\n');
        if (lineEnd < 0) return;
        const line = buffer.slice(0, lineEnd);
        buffer = buffer.slice(lineEnd + 2);
        const verb = line.split(' ')[0].toUpperCase();
        commands.push(line);
        if (verb === 'EHLO') socket.write('250-sink\r\n250-AUTH PLAIN LOGIN\r\n250 8BITMIME\r\n');
        else if (verb === 'AUTH') socket.write('235 2.7.0 Accepted\r\n');
        else if (verb === 'DATA') { inData = true; socket.write('354 Go ahead\r\n'); }
        else if (verb === 'QUIT') { socket.write('221 Bye\r\n'); socket.end(); }
        else socket.write('250 Ok\r\n');
      }
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ port: server.address().port, commands, messages, close: () => server.close() }));
  });
}

test('deliverEmail sends an invoice-shaped message through real nodemailer', async (t) => {
  const sink = await startSmtpSink();
  t.after(() => sink.close());
  const writes = [];
  const queueDoc = { id: 'queue-1', set: async (value) => writes.push(value), update: async (value) => writes.push(value) };
  t.after(api.__set__({
    process: { env: { SMTP_HOST: '127.0.0.1', SMTP_PORT: String(sink.port), SMTP_SECURE: 'false', SMTP_USER: 'test', SMTP_PASS: 'test-only', MAIL_FROM: 'KeeleSepp <arved@mail.ee>' } },
    db: { collection: () => ({ doc: () => queueDoc }) },
  }));
  const pdf = Buffer.alloc(30000, 'PDF-bytes-');

  const result = await api.__get__('deliverEmail')({
    to: 'student@mail.ee',
    replyTo: 'info@mail.ee',
    subject: 'Arve KS-2026-104 — Õäöü счёт',
    html: '<p>Tere, Õie!</p>',
    text: 'Tere, Õie!',
    headers: { 'List-Unsubscribe': '<https://crm.epkoolitus.ee/u?t=abc>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    attachments: [{ filename: 'Arve KS-2026-104.pdf', contentType: 'application/pdf', content: pdf }],
  });

  assert.equal(result.status, 'sent');
  assert.equal(result.provider, 'smtp');
  assert.ok(result.providerId);
  assert.equal(writes.at(-1).status, 'sent');
  assert.ok(sink.commands.some((line) => line.toUpperCase().startsWith('AUTH')), 'logs in');
  assert.ok(sink.commands.some((line) => line.includes('<student@mail.ee>')), 'envelope recipient');

  assert.equal(sink.messages.length, 1);
  const raw = sink.messages[0];
  const head = raw.split('\r\n\r\n')[0].replace(/\r\n\s+/g, ' ');
  assert.match(head, /^To: student@mail\.ee$/m);
  assert.match(head, /^Reply-To: info@mail\.ee$/m);
  assert.match(head, /^List-Unsubscribe: <https:\/\/crm\.epkoolitus\.ee\/u\?t=abc>$/m);
  assert.match(head, /^List-Unsubscribe-Post: List-Unsubscribe=One-Click$/m);
  assert.match(head, /^Subject: =\?UTF-8\?/m);

  const part = raw.split(/\r\n--/).find((section) => section.includes('application/pdf'));
  assert.match(part, /filename="?Arve KS-2026-104\.pdf"?/);
  assert.match(part, /Content-Transfer-Encoding: base64/);
  const body = part.split('\r\n\r\n').slice(1).join('').replace(/\s/g, '');
  assert.ok(Buffer.from(body, 'base64').equals(pdf), 'the PDF arrives byte for byte');
});
