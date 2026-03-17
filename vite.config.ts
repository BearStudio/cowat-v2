import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import cpy from 'cpy';
import { Nitro } from 'nitro/types';
import { nitro } from 'nitro/vite';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

const { nitroRetrieveServerDirHook, prismaCopyBinariesPlugin } =
  createPrismaCopyBinariesPlugin();

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    server: {
      port: env.VITE_PORT ? Number(env.VITE_PORT) : 3000,
      strictPort: true,
    },
    plugins: [
      devtools(),
      tsConfigPaths(),
      tanstackStart(),
      nitro({
        modules: [
          (nitro) => {
            nitro.hooks.hook('build:before', () => {
              nitroRetrieveServerDirHook(nitro);
            });
          },
        ],
        routeRules: { '/storybook': { redirect: '/storybook/' } },
        // Some pre-compiled packages (e.g. TanStack devtools) use jsxDEV from
        // react/jsx-dev-runtime. Nitro's CJS→ESM conversion of that module
        // breaks its named exports, making jsxDEV undefined at runtime.
        // We inline a shim that re-exports jsx as jsxDEV from jsx-runtime,
        // which is identical to what React 19 production does internally.
        rollupConfig: {
          plugins: [
            {
              name: 'fix-jsx-dev-runtime-ssr',
              resolveId(id: string) {
                if (id === 'react/jsx-dev-runtime') {
                  return '\0jsx-dev-runtime-shim';
                }
              },
              load(id: string) {
                if (id === '\0jsx-dev-runtime-shim') {
                  return `export { jsx as jsxDEV, jsxs, Fragment } from 'react/jsx-runtime';`;
                }
              },
            },
          ],
        },
      }),
      // react's vite plugin must come after start's vite plugin
      viteReact({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
      // Copy prisma binaries at the end
      prismaCopyBinariesPlugin(),
    ],
  };
});

function createPrismaCopyBinariesPlugin() {
  let serverDir = '';
  return {
    nitroRetrieveServerDirHook: (nitro: Nitro) => {
      serverDir = nitro.options.output.serverDir.replace(resolve('.'), '.');
    },
    prismaCopyBinariesPlugin: () => ({
      name: 'prisma-copy-binaries',
      writeBundle: async (outputOptions: { dir?: string }) => {
        const outputDir = outputOptions.dir?.replace(resolve('.'), '.');
        if (outputDir === serverDir) {
          await cpy('./src/server/db/generated/**/*.node', resolve(serverDir));
        }
      },
    }),
  };
}
