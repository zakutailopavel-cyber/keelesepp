// Attribution for an Openverse (openly licensed) photo: short caption on the sheet, full credit kept in the block.
export function openverseCredit(item) {
  const license = `CC ${String(item.license || '').toUpperCase()} ${item.license_version || ''}`.trim();
  return { caption: `Foto: ${item.creator || 'tundmatu autor'} · ${license}`, credit: item.attribution || '', source: item.foreign_landing_url || '' };
}

// Openverse searches English tags best: an Estonian or Russian query is translated first (MyMemory, free, only the
// search words are sent). Any failure keeps the teacher's own words.
export async function englishQuery(query, fetcher = globalThis.fetch) {
  const text = String(query || '').trim();
  if (!text) return text;
  try {
    const from = /[а-яё]/i.test(text) ? 'ru' : 'et';
    const response = await fetcher(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|en`);
    if (!response?.ok) return text;
    const data = await response.json();
    const translated = String(data?.responseData?.translatedText || '').trim();
    return translated && !/MYMEMORY WARNING|INVALID/i.test(translated) ? translated.toLowerCase() : text;
  } catch {
    return text;
  }
}

// what kind of picture: photos, drawings (best for worksheets) or everything
export const IMAGE_KINDS = [['', 'Kõik'], ['illustration', 'Joonistused'], ['photograph', 'Fotod']];
