import { PrismaPg } from '@prisma/adapter-pg';

import { envServer } from '@/env/server';
import { timingStore } from '@/server/timing-store';

import { Prisma, PrismaClient } from './generated/client';

const levels = {
  trace: ['query', 'error', 'warn', 'info'],
  debug: ['error', 'warn', 'info'],
  info: ['error', 'warn', 'info'],
  warn: ['error', 'warn'],
  error: ['error'],
  fatal: ['error'],
} satisfies Record<string, ('query' | 'error' | 'warn' | 'info')[]>;

const SOFT_DELETE_MODELS = ['Location', 'Commute', 'CommuteTemplate'] as const;

const SOFT_DELETE_READ_OPERATIONS = [
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'findUnique',
  'findUniqueOrThrow',
  'count',
  'aggregate',
  'groupBy',
] as const;

// Stored reference to the extended client, used by the soft-delete
// extension to convert delete operations into update operations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: any;

function createPrisma() {
  const adapter = new PrismaPg({
    connectionString: envServer.DATABASE_URL,
  });

  const client = new PrismaClient({
    adapter,
    log: levels[envServer.LOGGER_LEVEL],
  })
    .$extends({
      name: 'soft-delete',
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            if (
              !SOFT_DELETE_MODELS.includes(
                model as (typeof SOFT_DELETE_MODELS)[number]
              )
            ) {
              return query(args);
            }

            // For read operations, automatically filter out soft-deleted records
            if (
              SOFT_DELETE_READ_OPERATIONS.includes(
                operation as (typeof SOFT_DELETE_READ_OPERATIONS)[number]
              )
            ) {
              const a = args as { where?: Record<string, unknown> };
              a.where = { ...a.where, isDeleted: false };
              return query(args);
            }

            // Intercept delete → soft-delete (update isDeleted flag)
            if (operation === 'delete') {
              const prop = model.charAt(0).toLowerCase() + model.slice(1);
              return _client[prop].update({
                where: args.where,
                data: { isDeleted: true },
              });
            }

            if (operation === 'deleteMany') {
              const prop = model.charAt(0).toLowerCase() + model.slice(1);
              return _client[prop].updateMany({
                where: args.where,
                data: { isDeleted: true },
              });
            }

            return query(args);
          },
        },
      },
    })
    .$extends({
      name: 'server-timing',
      query: {
        $allModels: {
          async $allOperations({ query, args, model, operation }) {
            const start = performance.now();

            const result = await query(args);

            const duration = performance.now() - start;

            const store = timingStore.getStore();
            if (store) {
              store.prisma.push({
                model,
                operation,
                duration,
              });
            }

            return result;
          },
        },
      },
    })
    .$extends({
      name: 'cursor-pagination',
      model: {
        $allModels: {
          async findManyPaginated<T, A>(
            this: T,
            findManyArgs: Prisma.Exact<A, Prisma.Args<T, 'findMany'>>,
            opts: { limit: number; cursor?: string }
          ): Promise<[number, Prisma.Result<T, A, 'findMany'>]> {
            const ctx = Prisma.getExtensionContext(this) as never;
            return Promise.all([
              (ctx as any).count({
                where: (findManyArgs as any).where,
              }),
              (ctx as any).findMany({
                ...(findManyArgs as any),
                take: opts.limit + 1,
                cursor: opts.cursor ? { id: opts.cursor } : undefined,
              }),
            ]);
          },
        },
      },
    });

  _client = client;
  return client;
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrisma> | undefined;
  serverTiming?: Array<{ key: string; duration: string }>;
};

export const db = globalForPrisma.prisma ?? createPrisma();

if (import.meta.env?.DEV) globalForPrisma.prisma = db;

export type AppDB = typeof db;
