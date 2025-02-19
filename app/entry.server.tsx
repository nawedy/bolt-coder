import type { AppLoadContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderToReadableStream } from 'react-dom/server';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import { themeStore } from '~/lib/stores/theme';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: any,
  _loadContext: AppLoadContext,
) {
  try {
    const callbackName = isbot(request.headers.get('user-agent')) ? 'onAllReady' : 'onShellReady';

    const head = renderHeadToString({ request, remixContext, Head });
    const htmlStart = `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`;
    const htmlEnd = '</div></body></html>';

    const stream = await renderToReadableStream(<RemixServer context={remixContext} url={request.url} />, {
      signal: request.signal,
      [callbackName]() {
        responseHeaders.set('Content-Type', 'text/html');
        responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
        responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
      },
      onError(error: unknown) {
        console.error('Streaming error:', error);
        responseStatusCode = 500;
      },
    });

    if (responseStatusCode === 500) {
      await stream.allReady;
    }

    const transformStream = new TransformStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(htmlStart));
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      flush(controller) {
        controller.enqueue(new TextEncoder().encode(htmlEnd));
      },
    });

    return new Response(stream.pipeThrough(transformStream), {
      status: responseStatusCode,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Server error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
