import { STUDY_TERMS_SECTIONS, STUDY_TERMS_VERSION } from './studyTerms.js';

export default function StudyTermsContent({ compact = false }) {
  return (
    <div className={compact ? 'study-terms-content study-terms-content--compact' : 'study-terms-content'}>
      <div className="study-terms-version">Kehtiv versioon: {STUDY_TERMS_VERSION}</div>
      {STUDY_TERMS_SECTIONS.map((section, index) => (
        <section className="study-terms-section" key={section.title}>
          <h2>{index + 1}. {section.title}</h2>
          {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </section>
      ))}
      <div className="study-terms-links">
        <a href="https://www.epkoolitus.ee/tingimused/" target="_blank" rel="noreferrer">Kasutustingimused</a>
        <a href="https://www.epkoolitus.ee/privaatsus/" target="_blank" rel="noreferrer">Privaatsuspoliitika</a>
      </div>
    </div>
  );
}
