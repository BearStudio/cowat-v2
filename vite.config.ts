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
        // React 19 intentionally exports jsxDEV=undefined in production builds.
        // Some pre-compiled dependencies (e.g. TanStack packages) use jsxDEV,
        // so we intercept react/jsx-dev-runtime and re-export jsx as jsxDEV
        // from the production jsx-runtime (which has jsx as a real function).
        // We also inline react/jsx-runtime via rollup so its CJS→ESM conversion
        // is handled correctly (nft can break named exports like jsx/jsxs).
        externals: { inline: ['react/jsx-runtime'] },
        rollupConfig: {
          plugins: [
            {
              name: 'stub-react-jsx-dev-runtime',
              resolveId(id: string) {
                if (id === 'react/jsx-dev-runtime') {
                  return '\0react-jsx-dev-runtime-stub';
                }
              },
              load(id: string) {
                if (id === '\0react-jsx-dev-runtime-stub') {
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
