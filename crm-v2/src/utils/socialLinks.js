// Facebook / Instagram contact of a student: the admin types a username or pastes a profile link; the card shows
// links to the profile and to a direct message.

const clean = (value) => String(value ?? '').trim();

function fromUrl(value, hosts) {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (!hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null;
    return url;
  } catch {
    return null;
  }
}

export function facebookContact(raw) {
  const value = clean(raw);
  if (!value) return null;
  const url = fromUrl(value, ['facebook.com', 'fb.com', 'm.me']);
  if (url) {
    const id = url.searchParams.get('id');
    if (id && /^\d+$/.test(id)) return { label: `ID ${id}`, profileUrl: `https://www.facebook.com/profile.php?id=${id}`, messageUrl: `https://www.facebook.com/messages/t/${id}` };
    const name = url.pathname.split('/').filter(Boolean).find((part) => !['people', 'profile.php', 'messages', 't'].includes(part));
    if (!name) return null;
    return { label: name, profileUrl: `https://www.facebook.com/${name}`, messageUrl: `https://m.me/${name}` };
  }
  const name = value.replace(/^@/, '');
  if (!/^[A-Za-z0-9.]{3,80}$/.test(name)) return null;
  return { label: name, profileUrl: `https://www.facebook.com/${name}`, messageUrl: `https://m.me/${name}` };
}

export function instagramContact(raw) {
  const value = clean(raw);
  if (!value) return null;
  const url = fromUrl(value, ['instagram.com', 'ig.me']);
  const name = (url ? url.pathname.split('/').filter(Boolean).find((part) => part !== 'm') || '' : value).replace(/^@/, '');
  if (!/^[A-Za-z0-9._]{1,30}$/.test(name)) return null;
  return { label: `@${name}`, profileUrl: `https://www.instagram.com/${name}/`, messageUrl: `https://ig.me/m/${name}` };
}
