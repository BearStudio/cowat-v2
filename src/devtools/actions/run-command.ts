import { createServerFn } from '@tanstack/react-start';
import { Result } from 'better-result';
import { z } from 'zod';

export type CommandResult = { success: boolean; output: string };

const ALLOWED_SCRIPTS = [
  'db:push',
  'db:seed',
  'db:init',
  'db:ui',
  'dk:init',
  'dk:start',
  'dk:stop',
  'dk:clear',
] as const;

const scriptSchema = z.enum(ALLOWED_SCRIPTS);

export const runCommand = createServerFn({ method: 'POST' })
  .inputValidator(scriptSchema)
  .handler(async ({ data: script }): Promise<CommandResult> => {
    const { exec } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const execAsync = promisify(exec);

    const result = await Result.tryPromise(() => execAsync(`pnpm ${script}`));

    return result.match<CommandResult>({
      ok: ({ stdout, stderr }) => ({
        success: true,
        output: [stdout, stderr].filter(Boolean).join('\n'),
      }),
      err: (error) => ({
        success: false,
        output: error instanceof Error ? error.message : String(error),
      }),
    });
  });
