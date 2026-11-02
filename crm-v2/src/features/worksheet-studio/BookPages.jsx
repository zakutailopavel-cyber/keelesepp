// The textbook's own pages (BookPage.jsx): cover, contents, module opener, the module's words „Sõnad”, the review page
// „Korda” and the lesson head over a lesson's first sheet. Built only from existing data (bookProgram.js); they share
// the sheet page frame (270 mm canvas, A4 on print) and the house theme „Klassika”, with the one lime accent of the
// textbook art (docs/TEXTBOOK_ART_BIBLE.md §2), so the sheets and these pages read as one book.
import { Fragment } from 'react';
import { Target } from './engine/ui.jsx';

export const BOOK_THEME = 'klassika';

// running head and footer of every book page (the sheets get the same through Sheet `running`)
export function BookRunHead({ left, right }) {
  return <div className="ws-runhead is-book"><span>{left}</span><span>{right}</span></div>;
}
export function BookFooter({ course, page }) {
  return <div className="ws-ftr"><div className="ws-fl">KeeleSepp <small>by EP Koolitus</small></div><em /><div className="ws-url">{[course, page].filter(Boolean).join(' · ')}</div></div>;
}

function BookSheetPage({ className = '', children, kind, moduleKey }) {
  return <div className={`ws-page ws-book-page ${className}`} data-entity="book-page" data-book-page={kind} data-module={moduleKey || undefined}>{children}</div>;
}

export function Cover({ book, stats }) {
  return (
    <div className={`ws-root mode-print theme-${BOOK_THEME} ws-book-root`}>
      <BookSheetPage className="ws-book-cover" kind="cover">
        <div className="ws-logo">KeeleSepp<small>by EP Koolitus</small></div>
        <div className="ws-book-cover-title">
          {book.level && <div className="ws-book-cover-level">{book.level}</div>}
          <h1>{book.title || 'Õpik'}</h1>
          {book.subtitle && <p>{book.subtitle}</p>}
          {stats ? <p className="ws-book-cover-stats">{stats}</p> : null}
        </div>
        <div className="ws-book-cover-foot">{book.author}</div>
      </BookSheetPage>
    </div>
  );
}

// rows: bookContents() rows, already cut into pages (tocPages)
export function Contents({ pages, course, firstPage = 2 }) {
  return (
    <div className={`ws-root mode-print theme-${BOOK_THEME} ws-book-root`}>
      {pages.map((rows, index) => (
        <BookSheetPage className="ws-book-toc" kind="contents" key={index}>
          <BookRunHead left={course || 'Õpik'} right="Sisukord" />
          {index === 0 ? <h1 className="ws-book-h1">Sisukord</h1> : null}
          <ol>{rows.map((row) => (
            <li key={row.id} className={`is-${row.kind}`}><span>{row.title}</span><i /><b>{row.page ?? '–'}</b></li>
          ))}</ol>
          <BookFooter course={course} page={firstPage + index} />
        </BookSheetPage>
      ))}
    </div>
  );
}

const ruProps = { lang: 'ru' };

// Module opener: number and title, the module goal, the lessons with what the learner will be able to do, key words
export function ModuleOpener({ module, course, page, pageOf }) {
  // a long module (C1: ten lessons) is set tighter so the page stays one A4 page
  const dense = module.lessons.length > 6;
  const words = module.words.slice(0, dense ? 12 : 16);
  return (
    <div className={`ws-root mode-print theme-${BOOK_THEME} ws-book-root`}>
      <BookSheetPage className={`ws-book-opener${dense ? ' is-dense' : ''}`} kind="opener" moduleKey={module.key}>
        <BookRunHead left={course} right={module.label} />
        <header className="ws-book-opener-head">
          <div className="ws-book-blob" aria-hidden="true"><b>{module.number || ''}</b></div>
          <div>
            <div className="ws-book-kicker">Moodul {module.number || ''}</div>
            <h1 className="ws-book-h1">{module.title}</h1>
            {module.goal ? <p className="ws-book-goal" {...ruProps}>{module.goal}</p> : null}
          </div>
        </header>
        <section className="ws-book-sec">
          <h2>Selles moodulis</h2>
          <ol className="ws-book-lessons">{module.lessons.map((lesson) => (
            <li key={lesson.id}>
              <span className="ws-book-lnum">{lesson.number || '•'}</span>
              <div><b>{lesson.title}</b>{lesson.canDo ? <p><Target /><span>{lesson.canDo}</span></p> : lesson.focus ? <p className="is-focus">{lesson.focus}</p> : null}</div>
              <em>{pageOf(lesson.id) ?? ''}</em>
            </li>
          ))}</ol>
        </section>
        {words.length ? (
          <section className="ws-book-sec">
            <h2>Mooduli sõnad</h2>
            <ul className="ws-book-chips">{words.map((word) => <li key={`${word.lessonId}:${word.et}`}><b>{word.et}</b>{word.ru ? <small {...ruProps}>{word.ru}</small> : null}</li>)}</ul>
          </section>
        ) : null}
        <BookFooter course={course} page={page} />
      </BookSheetPage>
    </div>
  );
}

// „Sõnad”: every lesson word of the module, et + ru, grouped by lesson, two columns per page
export function WordsPage({ item, course, page }) {
  const { module } = item;
  return (
    <div className={`ws-root mode-print theme-${BOOK_THEME} ws-book-root`}>
      {item.chunks.map((groups, index) => (
        <BookSheetPage className="ws-book-words" kind="words" moduleKey={module.key} key={index}>
          <BookRunHead left={course} right={`${module.label} · Sõnad`} />
          {index === 0 ? <h1 className="ws-book-h1"><span className="ws-book-tag">Sõnad</span>{module.title}</h1> : null}
          <div className="ws-book-wordcols">{groups.map((group) => (
            <Fragment key={`${group.lessonId}:${group.cont ? 'c' : ''}`}>
              <h3>{group.number ? `${group.number}. ` : ''}{group.title}{group.cont ? <span> (järg)</span> : null}</h3>
              <dl>{group.words.map((word, i) => <div key={`${word.et}:${i}`}><dt>{word.et}</dt><dd {...ruProps}>{word.ru}</dd></div>)}</dl>
            </Fragment>
          ))}</div>
          <BookFooter course={course} page={page + index} />
        </BookSheetPage>
      ))}
    </div>
  );
}

// „Korda”: the module's goals as a checklist, its language focus and a word self-check (answers on the „Sõnad” page)
export function ReviewPage({ item, course, page, wordsPage }) {
  const { module, check } = item;
  const focus = module.lessons.filter((lesson) => lesson.focus);
  return (
    <div className={`ws-root mode-print theme-${BOOK_THEME} ws-book-root`}>
      <BookSheetPage className={`ws-book-review${module.lessons.length > 6 ? ' is-dense' : ''}`} kind="review" moduleKey={module.key}>
        <BookRunHead left={course} right={`${module.label} · Korda`} />
        <h1 className="ws-book-h1"><span className="ws-book-tag">Korda</span>{module.title}</h1>
        <section className="ws-book-sec">
          <h2>Ma oskan</h2>
          <table className="ws-book-check">
            <thead><tr><th>Mooduli eesmärgid</th><th>Oskan</th><th>Kordan veel</th></tr></thead>
            <tbody>{module.lessons.map((lesson) => (
              <tr key={lesson.id}><td><b>{lesson.number ? `${lesson.number}. ` : ''}{lesson.title}</b>{lesson.canDo ? <span>{lesson.canDo}</span> : null}</td><td><i aria-hidden="true" /></td><td><i aria-hidden="true" /></td></tr>
            ))}</tbody>
          </table>
        </section>
        {focus.length ? (
          <section className="ws-book-sec">
            <h2>Keel ja grammatika</h2>
            <ul className="ws-book-focus">{focus.map((lesson) => <li key={lesson.id}><b>{lesson.number || ''}</b><span>{lesson.focus}</span></li>)}</ul>
          </section>
        ) : null}
        {check.length ? (
          <section className="ws-book-sec">
            <h2>Sõnad: kirjuta eesti keeles</h2>
            <ol className="ws-book-selfcheck">{check.map((word, i) => <li key={`${word.et}:${i}`}><span {...ruProps}>{word.ru}</span><i aria-hidden="true" /></li>)}</ol>
            {wordsPage ? <p className="ws-book-answers">Kontrolli: Sõnad, lk {wordsPage}</p> : null}
          </section>
        ) : null}
        <BookFooter course={course} page={page} />
      </BookSheetPage>
    </div>
  );
}

// over the first sheet of a lesson: module · lesson number · title · what the learner learns · the lesson's sheets
// the goal is left out when the sheet's own header already shows the same sentence; then the language focus is shown
export function LessonHead({ lesson, module, sheetCanDo = '' }) {
  const same = lesson.canDo && lesson.canDo === String(sheetCanDo).replace(/\s+/g, ' ').trim();
  const showCanDo = lesson.canDo && !(same && lesson.focus);
  return (
    <div className="ws-lesson-head">
      <div className="ws-lesson-num"><small>Tund</small><b>{lesson.number || ''}</b></div>
      <div className="ws-lesson-main">
        <div className="ws-book-kicker">{module.label} · {module.title}</div>
        <h2>{lesson.title}</h2>
        {showCanDo ? <p><b>Mida õpid:</b> {lesson.canDo}</p> : lesson.focus ? <p><b>Keel:</b> {lesson.focus}</p> : null}
      </div>
      <ol className="ws-lesson-phases" aria-label="Tunni lehed">{lesson.sheets.map((sheet) => <li key={sheet.id}>{sheet.phaseLabel}</li>)}</ol>
    </div>
  );
}
