import { ThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';
import type { ReactNode } from 'react';
import '@/lib/dayjs/config';
import '@/lib/i18n';
import '@fontsource-variable/outfit';

import { QueryClientProvider } from '@/lib/tanstack-query/provider';

import { Sonner } from '@/components/ui/sonner';

export const Providers = (props: { children: ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      storageKey="theme"
      disableTransitionOnChange
    >
      <NuqsAdapter>
        <QueryClientProvider>
          {props.children}
          <Sonner richColors />
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
};
