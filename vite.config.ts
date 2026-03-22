import tailwindcss from '@tailwindcss/vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import { qrcode } from 'vite-plugin-qrcode';

import { createPrismaCopyBinariesPlugin } from './src/lib/vite-plugins/prisma-copy-binaries';

const { nitroRetrieveServerDirHook, prismaCopyBinariesPlugin } =
  createPrismaCopyBinariesPlugin();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    server: {
      port: env.VITE_PORT ? Number(env.VITE_PORT) : 3000,
      strictPort: true,
    },
    resolve: {
      tsconfigPaths: true,
    },
    plugins: [
      tailwindcss(),
      qrcode(),
      devtools(),
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
