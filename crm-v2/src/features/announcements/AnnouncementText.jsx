import { Fragment } from 'react';
import { textLines } from './announcementModel.js';

// the administrator's text as written: line breaks kept, http(s) addresses as links, never HTML
export default function AnnouncementText({ body }) {
  return (
    <div className="announcement-text">
      {textLines(body).map((parts, index) => (
        <p key={index}>{parts.length ? parts.map((part, at) => (part.link
          ? <a key={at} href={part.link} target="_blank" rel="noopener noreferrer">{part.link}</a>
          : <Fragment key={at}>{part.text}</Fragment>)) : ' '}</p>
      ))}
    </div>
  );
}
