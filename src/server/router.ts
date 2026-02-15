import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import accountRouter from './routers/account';
import bookingRouter from './routers/booking';
import commuteRouter from './routers/commute';
import commuteTemplateRouter from './routers/commute-template';
import configRouter from './routers/config';
import locationRouter from './routers/location';
import statsRouter from './routers/stats';
import userRouter from './routers/user';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;
export const router = {
  account: accountRouter,
  booking: bookingRouter,
  commute: commuteRouter,
  commuteTemplate: commuteTemplateRouter,
  location: locationRouter,
  stats: statsRouter,
  user: userRouter,
  config: configRouter,
};
