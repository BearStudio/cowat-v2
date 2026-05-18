import { readFile } from 'node:fs/promises';
import { isAbsolute, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Plugin } from 'vite';

const stripQuery = (id: string) => id.split('?')[0] ?? id;

const toFilePath = (id: string) => {
  const cleanId = stripQuery(id);
  if (cleanId.startsWith('/@fs/')) {
    return cleanId.slice('/@fs'.length);
  }
  if (cleanId.startsWith('file://')) {
    return fileURLToPath(cleanId);
  }
  if (cleanId.startsWith('/src/')) {
    return cleanId.slice(1);
  }
  return cleanId;
};

const isInsideDirectory = (filePath: string, directoryPath: string) =>
  filePath === directoryPath || filePath.startsWith(`${directoryPath}${sep}`);

export function jsonModuleFallbackPlugin(): Plugin {
  const root = resolve('.');
  const srcDirectory = normalize(resolve(root, 'src'));

  const shouldHandle = (id: string) => {
    const filePath = normalize(
      isAbsolute(toFilePath(id))
        ? toFilePath(id)
        : resolve(root, toFilePath(id))
    );

    if (!filePath.endsWith('.json')) {
      return false;
    }

    return isInsideDirectory(filePath, srcDirectory);
  };

  const loadJsonModule = async (id: string) => {
    const filePath = normalize(
      isAbsolute(toFilePath(id))
        ? toFilePath(id)
        : resolve(root, toFilePath(id))
    );
    const source = await readFile(filePath, 'utf8');
    JSON.parse(source);

    return {
      code: `export default JSON.parse(${JSON.stringify(source)});\n`,
      map: null,
    };
  };

  return {
    name: 'json-module-fallback',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = request.url;

        if (
          !url?.startsWith('/src/') ||
          !url.includes('?import') ||
          !shouldHandle(url)
        ) {
          next();
          return;
        }

        try {
          const result = await loadJsonModule(url);
          response.statusCode = 200;
          response.setHeader('Content-Type', 'text/javascript');
          response.setHeader('Cache-Control', 'no-cache');
          response.end(result.code);
        } catch (error) {
          next(error);
        }
      });
    },
  };
}
