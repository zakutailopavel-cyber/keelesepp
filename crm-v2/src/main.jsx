import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './app/eagerStyles.js';
import App from './App.jsx';
import { AuthProvider } from './app/AuthContext.jsx';
import './styles/index.css';
import { reloadOnceForNewBuild } from './app/staleBuild.js';
import { clientErrors, installClientErrorListeners } from './features/client-errors/clientErrorReporter.js';
import { clientErrorsService } from './services/firebase/clientErrors.js';
import { installTranslateGuard } from './app/translateGuard.js';

// the browser's page translation must not crash a lesson (translateGuard.js)
installTranslateGuard();

// client error tracking (admin „Vead”): page errors and unhandled rejections → clientErrors (no personal data)
clientErrors.setSender((record) => clientErrorsService.send(record));
installClientErrorListeners(globalThis);

// a lazy page file of an older build is missing after a deploy: reload once instead of a blank screen
globalThis.addEventListener('vite:preloadError', (event) => {
  if (reloadOnceForNewBuild()) event.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider><App /></AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
