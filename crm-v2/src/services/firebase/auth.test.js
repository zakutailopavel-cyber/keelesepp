import { normalizeOwnProfileInput } from './auth.js';

describe('auth profile validation', () => {
  it('normalizes the only self-service profile fields', () => {
    expect(normalizeOwnProfileInput({ displayName: ' Mari Tamm ', phone: ' +372 555 ', role: 'admin' })).toEqual({ displayName: 'Mari Tamm', phone: '+372 555' });
  });

  it('rejects an empty name and an invalid phone', () => {
    expect(() => normalizeOwnProfileInput({ displayName: ' ' })).toThrow('Nimi on kohustuslik');
    expect(() => normalizeOwnProfileInput({ displayName: 'Mari', phone: '123' })).toThrow('telefoninumbrit');
  });
});
