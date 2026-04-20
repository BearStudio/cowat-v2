import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createORPCReactQueryUtils } from '@orpc/react-query';
import type { RouterClient } from '@orpc/server';

import { envClient } from '@/env/client';

import type { Router } from './types';

const link = new RPCLink({
  url:
    typeof window === 'undefined'
      ? `${envClient.VITE_BASE_URL}/api/rpc`
      : `${window.location.origin}/api/rpc`,
});

export const orpcClient: RouterClient<Router> = createORPCClient(link);

export const orpc = createORPCReactQueryUtils(orpcClient);
