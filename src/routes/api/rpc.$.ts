import { RPCHandler } from '@orpc/server/fetch';
import { CORSPlugin, ResponseHeadersPlugin } from '@orpc/server/plugins';
import { createFileRoute } from '@tanstack/react-router';

import { router } from '@/server/router';

const handler = new RPCHandler(router, {
  plugins: [new CORSPlugin(), new ResponseHeadersPlugin()],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {}, // Provide initial context if needed
  });

  return response ?? new Response('Not Found', { status: 404 });
}

async function handlePost({ request }: { request: Request }) {
  // The body of `request` is locked by the TanStack Start / Nitro adapter
  // before it reaches us, so forwarding it to oRPC leaves the procedure
  // with an empty payload. We read it as text and rebuild a fresh Request.
  //
  // Drop this (and merge with `handle` again) once an oRPC mutation runs
  // through `handle(request, ...)` directly without losing its input.
  const body = await request.text();

  const { response } = await handler.handle(
    new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body,
    }),
    {
      prefix: '/api/rpc',
      context: {}, // Provide initial context if needed
    }
  );

  return response ?? new Response('Not Found', { status: 404 });
}

export const Route = createFileRoute('/api/rpc/$')({
  server: {
    handlers: {
      GET: handle,
      POST: handlePost,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
