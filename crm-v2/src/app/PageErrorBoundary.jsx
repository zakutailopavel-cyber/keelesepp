import { Component } from 'react';
import { ErrorState } from '../components/ui/index.js';
import { isStaleBuildError, reloadOnceForNewBuild } from './staleBuild.js';
import { clientErrors } from '../features/client-errors/clientErrorReporter.js';

// A page that throws (or whose code file vanished after a deploy) shows a message instead of a blank screen.
export default class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (isStaleBuildError(error)) { reloadOnceForNewBuild(); return; }
    // the top frame of the error's own stack, else of the component stack (no props, no state)
    (this.props.reporter || clientErrors).report('render', error, { stack: error?.stack || info?.componentStack || '' });
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const stale = isStaleBuildError(error);
    return (
      <div className="page-content">
        <ErrorState
          title={stale ? 'KeeleSepp uuenes' : 'Lehte ei saanud avada'}
          message={stale ? 'Laadi leht uuesti, et avada uus versioon.' : error.message || 'Tundmatu viga.'}
          onRetry={() => globalThis.location.reload()}
        />
      </div>
    );
  }
}
