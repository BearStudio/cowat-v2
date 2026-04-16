/* eslint-disable no-process-env */
import { InferRouterInputs, InferRouterOutputs } from '@orpc/server';

import accountRouter from './routers/account';
import bookingRouter from './routers/booking';
import commuteRouter from './routers/commute';
import commuteRequestRouter from './routers/commute-request';
import commuteTemplateRouter from './routers/commute-template';
import configRouter from './routers/config';
import locationRouter from './routers/location';
import orgNotificationChannelRouter from './routers/org-notification-channel';
import organizationRouter from './routers/organization';
import statsRouter from './routers/stats';
import userRouter from './routers/user';

export type Router = typeof router;
export type Inputs = InferRouterInputs<typeof router>;
export type Outputs = InferRouterOutputs<typeof router>;

const testRouters =
  process.env.NODE_ENV === 'test'
    ? { test: (await import('./routers/test.router')).default }
    : {};

export const router = {
  account: accountRouter,
  booking: bookingRouter,
  commute: commuteRouter,
  commuteRequest: commuteRequestRouter,
  commuteTemplate: commuteTemplateRouter,
  location: locationRouter,
  orgNotificationChannel: orgNotificationChannelRouter,
  organization: organizationRouter,
  stats: statsRouter,
  user: userRouter,
  config: configRouter,
  ...testRouters,
};
