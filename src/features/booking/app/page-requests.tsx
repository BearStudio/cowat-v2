import { PlusIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { CountBadge } from '@/components/count-badge';
import {
  COMMUTE_ACTIONS,
  ResponsiveActions,
} from '@/components/ui/responsive-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BookingRequestsList } from '@/features/booking/booking-requests-list';
import { CommuteRequestsList } from '@/features/commute-request/commute-requests-list';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageRequests = () => {
  const { t } = useTranslation(['booking', 'commuteRequest']);

  const { data: bookingCount } = useQuery(
    orpc.booking.pendingRequestCount.queryOptions()
  );

  const { data: commuteRequestsPage } = useQuery(
    orpc.commuteRequest.getAll.queryOptions({ input: { limit: 1 } })
  );

  return (
    <PageLayout>
      <PageLayoutTopBar
        endActions={
          <ResponsiveActions
            icon={<PlusIcon />}
            label="commute:list.newAction"
            actions={COMMUTE_ACTIONS}
            ns={['commute']}
          />
        }
      >
        <PageLayoutTopBarTitle>
          {t('booking:requests.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-40 md:pb-0">
        <Tabs defaultValue="bookings" className="flex-col gap-4">
          <TabsList className="w-full">
            <TabsTrigger value="bookings">
              {t('booking:requests.tabs.bookings')}
              <CountBadge count={bookingCount?.count} />
            </TabsTrigger>
            <TabsTrigger value="commuteRequests">
              {t('booking:requests.tabs.commuteRequests')}
              <CountBadge count={commuteRequestsPage?.total} />
            </TabsTrigger>
          </TabsList>
          <TabsContent value="bookings" className="flex-initial">
            <BookingRequestsList />
          </TabsContent>
          <TabsContent value="commuteRequests" className="flex-initial">
            <CommuteRequestsList />
          </TabsContent>
        </Tabs>
      </PageLayoutContent>
    </PageLayout>
  );
};
