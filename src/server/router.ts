import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import accountRouter from './routers/account';
import commuteRouter from './routers/commute';
import configRouter from './routers/config';
import locationRouter from './routers/location';
import userRouter from './routers/user';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  account: accountRouter,
  commute: commuteRouter,
  location: locationRouter,
  user: userRouter,
  config: configRouter,
};
