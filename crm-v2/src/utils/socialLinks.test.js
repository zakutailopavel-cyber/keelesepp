import { facebookContact, instagramContact } from './socialLinks.js';

describe('student social contacts', () => {
  it('reads a Facebook username, profile link or numeric profile id', () => {
    expect(facebookContact('mari.maasikas')).toEqual({ label: 'mari.maasikas', profileUrl: 'https://www.facebook.com/mari.maasikas', messageUrl: 'https://m.me/mari.maasikas' });
    expect(facebookContact('https://www.facebook.com/mari.maasikas/')?.messageUrl).toBe('https://m.me/mari.maasikas');
    expect(facebookContact('facebook.com/profile.php?id=100012345')).toEqual({ label: 'ID 100012345', profileUrl: 'https://www.facebook.com/profile.php?id=100012345', messageUrl: 'https://www.facebook.com/messages/t/100012345' });
    expect(facebookContact('https://evil.example/mari')).toBeNull();
    expect(facebookContact('')).toBeNull();
  });

  it('reads an Instagram handle or link', () => {
    expect(instagramContact('@mari_m')).toEqual({ label: '@mari_m', profileUrl: 'https://www.instagram.com/mari_m/', messageUrl: 'https://ig.me/m/mari_m' });
    expect(instagramContact('https://instagram.com/mari_m?igsh=x')?.label).toBe('@mari_m');
    expect(instagramContact('not a handle!')).toBeNull();
  });
});
