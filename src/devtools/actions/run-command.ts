import { createServerFn } from '@tanstack/react-start';
import { Effect } from 'effect';
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
    const [{ exec }, { promisify }] = await Promise.all([
      import('node:child_process'),
      import('node:util'),
    ]);
    const execAsync = promisify(exec);

    return await Effect.runPromise(
      Effect.match(
        Effect.tryPromise(() => execAsync(`pnpm ${script}`)),
        {
          onSuccess: ({ stdout, stderr }): CommandResult => ({
            success: true,
            output: [stdout, stderr].filter(Boolean).join('\n'),
          }),
          onFailure: (error): CommandResult => ({
            success: false,
            output: error instanceof Error ? error.message : String(error),
          }),
        }
      )
    );
  });
