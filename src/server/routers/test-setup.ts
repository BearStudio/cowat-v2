import { beforeEach, vi } from 'vitest';

import {
  mockDb,
  mockGetSession,
  mockHasPermission,
  mockUserHasPermission,
  setupAuthenticatedUser,
} from '@/server/routers/test-utils';

vi.mock('@/server/auth', () => ({
  auth: {
    api: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      userHasPermission: (...args: unknown[]) => mockUserHasPermission(...args),
      hasPermission: (...args: unknown[]) => mockHasPermission(...args),
    },
  },
}));

vi.mock('@tanstack/react-start/server', () => ({
  getRequestHeaders: () => new Headers(),
}));

vi.mock('@/env/client', () => ({
  envClient: {},
}));

vi.mock('@/env/server', () => ({
  envServer: {
    LOGGER_LEVEL: 'error',
    LOGGER_PRETTY: false,
  },
}));

vi.mock('@/server/logger', () => ({
  logger: {
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

vi.mock('@/server/db', () => ({ db: mockDb }));

beforeEach(() => {
  vi.clearAllMocks();
  setupAuthenticatedUser();
});
