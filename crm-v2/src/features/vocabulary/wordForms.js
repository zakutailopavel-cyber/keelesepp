// The three key forms of an Estonian word on the student's cards (owner 2026-10-12: „все слова должны быть в трех
// формах”): soodustus, soodustuse, soodustust / tegema, teha, teeb. From the word's own forms line (EKI, saved when the
// word was added) or from /word-forms.json (EKI level lemmas + Vabamorf, built by tools/lexicon/build_key_forms.py).
import { useEffect, useState } from 'react';

let loading = null;
export function loadWordForms(fetcher = globalThis.fetch) {
  if (!loading) {
    loading = Promise.resolve()
      .then(() => fetcher('/word-forms.json'))
      .then((response) => (response?.ok ? response.json() : { forms: {} }))
      .then((data) => data?.forms || {})
      .catch(() => ({}));
  }
  return loading;
}

const clean = (value) => String(value || '').trim().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '').toLocaleLowerCase('et');

// three forms or [] (a phrase, an unknown word)
export function keyForms(word, hint = '', dictionary = {}) {
  const fromHint = String(hint || '').split(',').map((part) => part.trim()).filter(Boolean);
  if (fromHint.length >= 3) return fromHint.slice(0, 3);
  const key = clean(word);
  if (!key || /\s/.test(key)) return [];
  return dictionary[key] || [];
}

// words the file does not know are asked from EKI through the server, 30 at a time, each word once per page load
const asked = new Map();
const MAX_ASK = 90;
export async function missingForms(words, dictionary, service) {
  if (typeof service?.keyForms !== 'function') return {};
  const missing = [...new Set(words.map((word) => clean(word)).filter((word) => word && !/\s/.test(word) && !dictionary[word] && !asked.has(word)))].slice(0, MAX_ASK);
  const found = {};
  for (let i = 0; i < missing.length; i += 30) {
    const batch = missing.slice(i, i + 30);
    batch.forEach((word) => asked.set(word, null));
    try {
      const data = await service.keyForms(batch);
      Object.entries(data?.forms || {}).forEach(([word, forms]) => { asked.set(word, forms); found[word] = forms; });
    } catch { /* the cards work without forms */ }
  }
  asked.forEach((forms, word) => { if (forms && !found[word]) found[word] = forms; });
  return found;
}

// cards: [{ front, hint }]; a card with its own forms line needs no lookup
export function useWordForms(cards = [], service = null) {
  const [dictionary, setDictionary] = useState({});
  const key = cards.map((card) => card.front).join('|');
  useEffect(() => {
    let alive = true;
    loadWordForms().then(async (forms) => {
      if (!alive) return;
      setDictionary(forms);
      const words = cards.filter((card) => keyForms(card.front, card.hint, forms).length === 0).map((card) => card.front);
      const extra = await missingForms(words, forms, service);
      if (alive && Object.keys(extra).length) setDictionary({ ...forms, ...extra });
    });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, service]);
  return dictionary;
}
