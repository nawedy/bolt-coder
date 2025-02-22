import { createRequestHandler } from '@remix-run/node';
import * as build from './build/index.js';

const handler = createRequestHandler(build, process.env.NODE_ENV);

const port = process.env.PORT || 3000;

const server = Bun.serve({
  port,
  fetch: handler,
});

console.log(`Server listening on port ${port}`);
