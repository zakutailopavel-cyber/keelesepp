import { Search, UserRound, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsService } from '../../services/firebase/index.js';
import { ROLES } from '../../utils/roles.js';
import './globalStudentSearch.css';

const MIN_QUERY_LENGTH = 2;

export default function GlobalStudentSearch({ user, studentRepository = studentsService }) {
  const navigate = useNavigate();
  const listboxId = useId();
  const timerRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !user.roles.includes(ROLES.ADMIN);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const selectStudent = (student) => {
    setQuery('');
    setResults([]);
    close();
    navigate(`/students/${student.id}`);
  };

  const search = (value) => {
    setQuery(value);
    setError('');
    setActiveIndex(-1);
    window.clearTimeout(timerRef.current);
    const normalized = value.trim();
    if (normalized.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setOpen(true);
    timerRef.current = window.setTimeout(async () => {
      try {
        const response = await studentRepository.list({
          search: normalized,
          status: 'active',
          pageSize: 8,
          exhaustive: true,
          ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}),
        });
        setResults(response.items.slice(0, 8));
      } catch (searchError) {
        setResults([]);
        setError(searchError.message || 'Õpilaste otsing ebaõnnestus.');
      } finally {
        setLoading(false);
      }
    }, 220);
  };

  const onKeyDown = (event) => {
    if (!open || !results.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? results.length - 1 : current - 1));
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      selectStudent(results[activeIndex]);
    } else if (event.key === 'Escape') {
      close();
    }
  };

  return (
    <div className="global-student-search" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) close();
    }}>
      <Search size={18} aria-hidden="true" />
      <input
        aria-label="Otsi õpilast"
        aria-autocomplete="list"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        placeholder="Otsi nime, telefoni või e-posti järgi…"
        value={query}
        onChange={(event) => search(event.target.value)}
        onFocus={() => query.trim().length >= MIN_QUERY_LENGTH && setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {query ? <button type="button" className="global-student-search__clear" aria-label="Tühjenda otsing" onClick={() => search('')}><X size={16} /></button> : null}
      {open ? (
        <div className="global-student-search__popover">
          {loading ? <p role="status">Otsin õpilasi…</p> : null}
          {!loading && error ? <p role="alert">{error}</p> : null}
          {!loading && !error && !results.length ? <p>Õpilasi ei leitud.</p> : null}
          {!loading && results.length ? (
            <ul id={listboxId} role="listbox" aria-label="Õpilaste otsingutulemused">
              {results.map((student, index) => (
                <li key={student.id} id={`${listboxId}-${index}`} role="option" aria-selected={index === activeIndex}>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => selectStudent(student)}>
                    <UserRound size={17} />
                    <span><strong>{student.name}</strong><small>{student.level || 'Tase puudub'} · {student.teacher || 'Õpetaja puudub'}</small></span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
