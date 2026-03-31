import { useQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import { CountBadge } from '@/components/count-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { BookingRequestsList } from '@/features/booking/booking-requests-list';
import { CommuteOptionsMenu } from '@/features/commute/commute-options-menu';
import { CommuteRequestsList } from '@/features/commute-request/commute-requests-list';
import { OrgFloatingActionButtonLink } from '@/features/organization/org-button-link';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageRequests = ({ tab }: { tab?: string }) => {
  const { t } = useTranslation(['booking', 'commute', 'commuteRequest']);

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
          <>
            <CommuteOptionsMenu />
            <OrgFloatingActionButtonLink
              label={t('commute:list.newAction')}
              variant="secondary"
              size="sm"
              to="/app/$orgSlug/commutes/new"
            >
              <PlusIcon />
            </OrgFloatingActionButtonLink>
          </>
        }
      >
        <PageLayoutTopBarTitle>
          {t('booking:requests.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent className="pb-40 md:pb-0">
        <Tabs defaultValue={tab ?? 'bookings'} className="flex-col gap-4">
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
