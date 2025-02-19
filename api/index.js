import * as build from '@remix-run/dev/server-build';
import { createRequestHandler } from '@remix-run/vercel';

const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext(event) {
    return {
      env: process.env,
      event,
    };
  },
});

export default async function vercelHandler(request, event) {
  try {
    const response = await handler(request, event);
    return response;
  } catch (error) {
    console.error('Vercel handler error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
