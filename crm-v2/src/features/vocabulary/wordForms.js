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

export function useWordForms() {
  const [dictionary, setDictionary] = useState({});
  useEffect(() => {
    let alive = true;
    loadWordForms().then((forms) => { if (alive) setDictionary(forms); });
    return () => { alive = false; };
  }, []);
  return dictionary;
}
