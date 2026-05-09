import { createFileRoute } from '@tanstack/react-router';

import { auth } from '@/server/auth';

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => {
        return auth.handler(request);
      },
      POST: async ({ request }) => {
        // The body of `request` is locked by the TanStack Start / Nitro
        // adapter before it reaches us, so forwarding it directly leaves
        // better-auth with an empty payload. We read it as text and rebuild
        // a fresh Request.
        //
        // Drop this once `request` arrives with an unconsumed body — i.e.
        // when `auth.handler(request)` directly returns a non-401 for a
        // POST in an e2e run.
        const body = await request.text();

        return await auth.handler(
          new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body,
          })
        );
      },
    },
  },
});
