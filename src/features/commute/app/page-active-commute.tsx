import { getUiState } from '@bearstudio/ui-state';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import {
  DataListErrorState,
  DataListLoadingState,
} from '@/components/ui/datalist';

import { authClient } from '@/features/auth/client';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageActiveCommute = ({
  params,
}: {
  params: { commuteId: string; orgSlug: string };
}) => {
  const { commuteId } = params;
  const { t } = useTranslation(['commute']);
  const session = authClient.useSession();
  const currentUserId = session.data?.user.id ?? '';

  const commuteQuery = useQuery(
    orpc.commute.getById.queryOptions({
      input: { id: commuteId },
    })
  );

  const ui = getUiState((set) => {
    if (commuteQuery.status === 'pending') return set('pending');
    if (commuteQuery.status === 'error') return set('error');
    return set('default', { commute: commuteQuery.data! });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar startActions={<BackButton />}>
        <PageLayoutTopBarTitle>
          {t('commute:active.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <DataListLoadingState />)
          .match('error', () => (
            <DataListErrorState retry={() => commuteQuery.refetch()} />
          ))
          .match('default', ({ commute }) => {
            const isDriver = currentUserId === commute.driver.id;
            return isDriver ? (
              <ActiveCommuteDriverView />
            ) : (
              <ActiveCommutePassengerView />
            );
          })
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};

function ActiveCommuteDriverView() {
  return (
    <div className="flex items-center justify-center p-12 text-muted-foreground">
      Driver view — coming soon
    </div>
  );
}

function ActiveCommutePassengerView() {
  return (
    <div className="flex items-center justify-center p-12 text-muted-foreground">
      Passenger view — coming soon
    </div>
  );
}
