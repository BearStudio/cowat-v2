import { getEnvHintTitlePrefix } from '@/features/devtools/env-hint';

export const getPageTitle = (pageTitle?: string) =>
  pageTitle
    ? `${getEnvHintTitlePrefix()} ${pageTitle} | Cowat`
    : `${getEnvHintTitlePrefix()} Cowat`;
