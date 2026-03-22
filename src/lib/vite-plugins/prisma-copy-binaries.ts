import cpy from 'cpy';
import { Nitro } from 'nitro/types';
import { resolve } from 'node:path';
import { type Plugin } from 'vite';

export function createPrismaCopyBinariesPlugin() {
  let serverDir = '';
  return {
    nitroRetrieveServerDirHook: (nitro: Nitro) => {
      serverDir = nitro.options.output.serverDir.replace(resolve('.'), '.');
    },
    prismaCopyBinariesPlugin: (): Plugin => ({
      name: 'prisma-copy-binaries',
      async writeBundle(outputOptions) {
        const outputDir = outputOptions.dir?.replace(resolve('.'), '.');
        if (outputDir === serverDir) {
          await cpy('./src/server/db/generated/**/*.node', resolve(serverDir));
        }
      },
    }),
  };
}
