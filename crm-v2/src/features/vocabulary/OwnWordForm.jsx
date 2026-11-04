import { Check, Sparkles } from 'lucide-react';
import { useRef, useState } from 'react';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { languageToolsService } from '../../services/firebase/languageTools.js';
import { WORD_LIMITS } from './wordsModel.js';
import { OWN_WORD_MAX, TRANSLATION_LANGUAGES, checkWord, findDuplicate, rememberTarget, rememberedTarget, savedVerdict, verdictText } from './ownWord.js';
import './vocabulary.css';

const LANG_LABEL = { et: 'eesti', en: 'English' };
const emptyForm = (word = {}) => ({
  word: word.word || '', translation: word.translation || '', example: word.example || '', forms: word.forms || '', formItems: word.formItems || [],
});

/**
 * „Lisa oma sõna” (owner 2026-11-04): the student types a word or a short phrase; „Kontrolli” asks the server for the
 * spelling (EKI), the base form and a translation (TartuNLP). Every field stays editable and the word can be saved
 * without a check. With `editing` the same form edits a word the student added (rules: own words only).
 * `words`: the student's list, for the duplicate notice; `onOpen(word)`: open the existing one instead.
 */
export default function OwnWordForm({
  studentId, user, words = [], languages = ['et'], defaultLang = '', editing = null,
  service = studentWordsService, toolsService = languageToolsService, onDone, onOpen,
}) {
  const [form, setForm] = useState(() => emptyForm(editing || {}));
  const [lang, setLang] = useState(defaultLang && languages.includes(defaultLang) ? defaultLang : languages[0] || 'et');
  const [tgt, setTgt] = useState(() => rememberedTarget());
  const [check, setCheck] = useState(null);
  const [checkedText, setCheckedText] = useState('');
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  // what the last check filled in: replaced by the next check unless the student changed it
  const auto = useRef({ translation: '', forms: '' });
  const targets = lang === 'en' ? [...TRANSLATION_LANGUAGES.filter((item) => item.value !== 'en'), { value: 'et', label: 'eesti' }] : TRANSLATION_LANGUAGES;
  const target = targets.some((item) => item.value === tgt) ? tgt : targets[0].value;

  const runCheck = async (value = form.word, options = {}) => {
    const typed = String(value || '').trim();
    if (!typed || checking) return;
    setChecking(true); setNotice('');
    const result = await checkWord(toolsService, { text: typed, lang: options.lang || lang, tgt: options.tgt || target });
    setChecking(false);
    setCheck(result); setCheckedText(typed);
    setForm((current) => {
      if (current.word.trim() !== typed) return current;
      const next = { ...current };
      if (result.translation && (!current.translation || current.translation === auto.current.translation)) next.translation = result.translation;
      if (result.formsLine && (!current.forms || current.forms === auto.current.forms)) { next.forms = result.formsLine; next.formItems = result.formItems; }
      auto.current = { translation: next.translation === result.translation ? result.translation : auto.current.translation, forms: next.forms === result.formsLine ? result.formsLine : auto.current.forms };
      return next;
    });
  };

  const takeWord = (value) => {
    // a suggestion or the base form: take it and check again (the old translation was for the other word)
    setForm((current) => ({ ...current, word: value, formItems: [], ...(current.translation === auto.current.translation ? { translation: '' } : {}), ...(current.forms === auto.current.forms ? { forms: '' } : {}) }));
    runCheck(value);
  };

  const duplicate = findDuplicate(words, form.word, check && checkedText === form.word.trim() ? check.lemma : '', editing?.id || '');
  const suggestions = check ? [...new Set([check.suggestion, ...check.words.filter((word) => word.known === false).flatMap((word) => (check.words.length === 1 ? word.suggestions : []))].filter(Boolean))].slice(0, 3) : [];
  const showLemma = check && check.lemma && check.lemma.toLocaleLowerCase('et') !== form.word.trim().toLocaleLowerCase('et') && checkedText === form.word.trim();

  const submit = async (event) => {
    event.preventDefault();
    if (!form.word.trim() || busy) return;
    setBusy(true); setError('');
    const checked = savedVerdict(check, checkedText, form.word);
    try {
      if (editing) await service.updateOwn(editing.id, { ...form, checked });
      else await service.addStudentWord({ studentId, user, ...form, checked });
      setNotice(editing ? 'Muudetud. · Изменено.' : `„${form.word.trim()}” lisati sinu sõnade hulka. · Добавлено.`);
      if (!editing) { setForm(emptyForm()); setCheck(null); setCheckedText(''); auto.current = { translation: '', forms: '' }; }
      onDone?.();
    } catch (next) {
      setError(next?.message || 'Sõna ei saanud salvestada.');
    } finally {
      setBusy(false);
    }
  };

  const set = (key) => (event) => {
    const value = event.target.value;
    // typed forms (or a new word) no longer match the dictionary's form table
    setForm((current) => ({ ...current, [key]: value, ...(key === 'forms' || key === 'word' ? { formItems: [] } : {}) }));
  };

  return (
    <form className="vw-form own-word" onSubmit={submit} aria-label={editing ? 'Muuda sõna' : 'Lisa oma sõna'}>
      {languages.length > 1 && !editing ? (
        <div className="own-word__langs" role="group" aria-label="Sõna keel">
          {languages.map((value) => <button type="button" key={value} className={`vw-chip${lang === value ? ' is-on' : ''}`} aria-pressed={lang === value}
            onClick={() => { setLang(value); setCheck(null); }}>{LANG_LABEL[value] || value}</button>)}
        </div>
      ) : null}
      <label className="vw-field"><span>{lang === 'en' ? 'Sõna või väljend inglise keeles' : 'Sõna või väljend · Слово или фраза'}</span>
        <input value={form.word} maxLength={OWN_WORD_MAX} required autoComplete="off" spellCheck={false} lang={lang}
          onChange={set('word')} onBlur={() => { if (form.word.trim() && form.word.trim() !== checkedText) runCheck(); }} /></label>
      <div className="vw-actions">
        <button type="button" className="vw-chip vw-lookup" disabled={checking || !form.word.trim()} onClick={() => runCheck()}>
          <Sparkles size={13} aria-hidden="true" /> {checking ? 'Kontrollin…' : lang === 'et' ? 'Kontrolli ja tõlgi' : 'Tõlgi'}
        </button>
        <label className="own-word__tgt"><span>Tõlge · Перевод:</span>
          <select value={target} aria-label="Tõlke keel" onChange={(event) => { setTgt(event.target.value); rememberTarget(event.target.value); if (check) runCheck(form.word, { tgt: event.target.value }); }}>
            {targets.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select></label>
      </div>
      {check && checkedText === form.word.trim() ? (
        <div className={`own-word__check is-${check.error ? 'error' : check.status}`} role="status">
          {check.status === 'ok' && !check.error ? <Check size={14} aria-hidden="true" /> : null}
          <span>{lang === 'en' && !check.error ? 'Ingliskeelse sõna õigekirja ei kontrollita. · Английское слово не проверяется.' : verdictText(check)}</span>
          {suggestions.length ? <span className="own-word__suggest">Kas mõtlesid · Может быть: {suggestions.map((value) => (
            <button type="button" key={value} className="vw-chip" onClick={() => takeWord(value)}>{value}</button>
          ))}?</span> : null}
          {showLemma ? <span className="own-word__suggest">Põhivorm · Начальная форма: <strong>{check.lemma}</strong>
            <button type="button" className="vw-chip" onClick={() => takeWord(check.lemma)}>Kasuta põhivormi</button></span> : null}
        </div>
      ) : null}
      {duplicate ? (
        <p className="vw-note own-word__dup" role="status">„{duplicate.word}” on sinu sõnade hulgas juba olemas. · Это слово уже есть.
          {onOpen ? <button type="button" className="vw-chip" onClick={() => onOpen(duplicate)}>Ava</button> : null}</p>
      ) : null}
      <label className="vw-field"><span>Tõlge või selgitus · Перевод</span>
        <input value={form.translation} maxLength={WORD_LIMITS.translation} autoComplete="off" onChange={set('translation')} /></label>
      <label className="vw-field"><span>Näitelause (kui tahad) · Пример</span>
        <input value={form.example} maxLength={WORD_LIMITS.example} autoComplete="off" lang={lang} onChange={set('example')} /></label>
      {lang === 'et' && (form.forms || check?.formsLine) ? <label className="vw-field"><span>Vormid · Формы</span>
        <input value={form.forms} maxLength={WORD_LIMITS.forms} autoComplete="off" onChange={set('forms')} /></label> : null}
      {check?.sources?.length && checkedText === form.word.trim() ? <p className="vw-muted">Allikas: {check.sources.join(', ')}. Tõlge on masintõlge — paranda vajadusel.</p> : null}
      {error ? <p className="vw-error" role="alert">{error}</p> : null}
      {notice ? <p className="vw-note" role="status">{notice}</p> : null}
      <div className="vw-actions">
        <button type="submit" className="vw-btn is-primary" disabled={busy || !form.word.trim()}>{busy ? 'Salvestan…' : editing ? 'Salvesta' : 'Lisa minu sõnadesse'}</button>
        {onDone && editing ? <button type="button" className="vw-btn" onClick={() => onDone()}>Loobu</button> : null}
      </div>
    </form>
  );
}
