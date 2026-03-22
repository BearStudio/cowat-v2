import { resolve } from 'node:path';
import { build, type Plugin } from 'vite';

import {
  SW_OUTPUT_FILENAME,
  SW_PUBLIC_PATH,
  SW_SOURCE_ENTRY,
} from '../../features/push/service-worker/constants';

export function serviceWorkerPlugin(): Plugin {
  return {
    name: 'service-worker-build',
    apply: 'build',
    async closeBundle() {
      await build({
        configFile: false,
        build: {
          emptyOutDir: false,
          lib: {
            entry: resolve(SW_SOURCE_ENTRY),
            formats: ['es'],
            fileName: () => SW_OUTPUT_FILENAME,
          },
          outDir: resolve('.output/public'),
          rollupOptions: { output: { inlineDynamicImports: true } },
        },
      });
    },
    configureServer(server) {
      // In dev, serve the TS source compiled on-the-fly
      server.middlewares.use(SW_PUBLIC_PATH, async (_req, res) => {
        const result = await server.transformRequest(`/${SW_SOURCE_ENTRY}`);
        res.setHeader('Content-Type', 'application/javascript');
        res.end(result?.code ?? '');
      });
    },
  };
}
