import type { AppLoadContext, EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any, // Temporarily use any to avoid type mismatch
  _loadContext: AppLoadContext,
) {
  const head = renderHeadToString({ request, remixContext, Head });
  const htmlStart = `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`;
  const htmlEnd = '</div></body></html>';

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  try {
    const markup = renderToString(<RemixServer context={remixContext} url={request.url} />);

    return new Response(`${htmlStart}${markup}${htmlEnd}`, {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Rendering error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
