import type { AppLoadContext, EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';
import { ENV } from './lib/config.server';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  // Initialize theme based on environment
  const theme = ENV.IS_VERCEL ? 'light' : themeStore.value;

  try {
    const head = renderHeadToString({ request, remixContext, Head });
    const htmlStart = `<!DOCTYPE html><html lang="en" data-theme="${theme}"><head>${head}</head><body><div id="root" class="w-full h-full">`;
    const htmlEnd = '</div></body></html>';

    responseHeaders.set('Content-Type', 'text/html');

    // Only set COOP/COEP headers in development
    if (ENV.NODE_ENV === 'development') {
      responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
      responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
    }

    const markup = renderToString(<RemixServer context={remixContext} url={request.url} />);

    return new Response(`${htmlStart}${markup}${htmlEnd}`, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Rendering error:', error);

    // Return a more detailed error in development
    const errorMessage =
      ENV.NODE_ENV === 'development'
        ? `Internal Server Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        : 'Internal Server Error';

    return new Response(errorMessage, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
