import { Component } from 'react';
import { Button } from '../../components/ui/index.js';
import { isStaleBuildError } from '../../app/staleBuild.js';
import { clientErrors } from '../client-errors/clientErrorReporter.js';

// One part of the lesson room (a side panel, the hints, the recorder, the worksheet, the room itself) that fails to
// load or throws shows a small „Laadi uuesti” in its own place — the call, the board and the rest of the room keep
// running instead of the whole page turning into an error screen.
// „Laadi uuesti”: a part of an older build (the site was updated during the lesson) needs the page reloaded; any
// other failure is first tried again in place.
export default class RoomPartBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.retry = this.retry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (isStaleBuildError(error)) return;
    try {
      (this.props.reporter || clientErrors).report('render', error, { stack: error?.stack || info?.componentStack || '' });
    } catch { /* reporting never breaks the room */ }
  }

  retry() {
    if (isStaleBuildError(this.state.error)) { (this.props.location || globalThis.location)?.reload(); return; }
    this.setState({ error: null });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const { label = 'Seda osa' } = this.props;
    return (
      <div className="action-error lr-part-error" role="alert">
        <span>{isStaleBuildError(error) ? 'KeeleSepp uuenes tunni ajal.' : `${label} ei saanud avada.`} </span>
        <Button variant="secondary" onClick={this.retry}>Laadi uuesti</Button>
      </div>
    );
  }
}
