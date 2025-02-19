import { RemixBrowser } from '@remix-run/react';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

function hydrate() {
  startTransition(() => {
    const root = document.getElementById('root');

    if (!root) {
      throw new Error('Root element not found. The application cannot be initialized.');
    }

    hydrateRoot(
      root,
      <StrictMode>
        <RemixBrowser />
      </StrictMode>,
    );
  });
}

if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(hydrate);
} else {
  /*
   * Safari doesn't support requestIdleCallback
   * https://caniuse.com/requestidlecallback
   */
  setTimeout(hydrate, 1);
}
