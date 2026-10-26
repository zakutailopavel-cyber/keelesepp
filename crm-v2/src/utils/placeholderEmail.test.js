import { describe, expect, it } from 'vitest';
import { isPlaceholderEmail } from './placeholderEmail.js';

describe('isPlaceholderEmail', () => {
  it('catches the made-up addresses people type to get past a form', () => {
    ['123@123.com', 'test@test.ee', 'a@a.com', 'aaa@aa.ee', 'mari@example.com', 'x@x.x.example.org', 'noemail@gmail.com', 'puudub@mail.ee', 'ema@1.ee', 'asd@asd.com', 'q@qwerty.ru']
      .forEach((email) => expect(isPlaceholderEmail(email), email).toBe(true));
  });
  it('lets real addresses through', () => {
    ['mari.tamm@gmail.com', 'info@epkoolitus.ee', 'ema@mail.ee', 'anna@hot.ee', 'test.kasutaja@gmail.com', 'a@epkoolitus.ee', '', 'not-an-email']
      .forEach((email) => expect(isPlaceholderEmail(email), email).toBe(false));
  });
});
