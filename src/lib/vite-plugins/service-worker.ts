import type { Plugin } from 'vite';

import {
  SW_PUBLIC_PATH,
  SW_SOURCE_ENTRY,
} from '../../features/push/service-worker/constants';

/**
 * In dev, serves the TypeScript service worker source compiled on-the-fly.
 * In production, the static JS file in public/ is used directly by Nitro/Vercel.
 */
export function serviceWorkerPlugin(): Plugin {
  return {
    name: 'service-worker-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(SW_PUBLIC_PATH, async (_req, res) => {
        const result = await server.transformRequest(`/${SW_SOURCE_ENTRY}`);
        res.setHeader('Content-Type', 'application/javascript');
        res.end(result?.code ?? '');
      });
    },
  };
}
