import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs';

const dashboardSearchParams = {
  bookingStop: parseAsString.withOptions({ history: 'replace' }),
  openCommutes: parseAsArrayOf(parseAsString)
    .withDefault([])
    .withOptions({ history: 'replace' }),
};

export const useDashboardSearchParams = () =>
  useQueryStates(dashboardSearchParams);
