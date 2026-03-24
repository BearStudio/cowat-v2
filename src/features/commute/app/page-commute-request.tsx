import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { toNoonUTC } from '@/lib/dayjs/to-noon-utc';
import { orpc } from '@/lib/orpc/client';
import { useNavigateBack } from '@/hooks/use-navigate-back';

import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const PageCommuteRequest = ({
  orgSlug,
  search,
}: {
  orgSlug: string;
  search: { date?: Date };
}) => {
  const { t } = useTranslation(['commute', 'common']);
  const { navigateBack } = useNavigateBack();
  const navigate = useNavigate();

  const requestDate = search.date;
  const [requestDestination, setRequestDestination] = useState('');

  const today = dayjs().startOf('day').toDate();

  const commuteRequest = useMutation(
    orpc.commuteRequest.create.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('commute:new.requestDrawer.success'));
        await context.client.invalidateQueries({
          queryKey: orpc.commuteRequest.getAll.key(),
          type: 'all',
        });
        navigateBack({
          to: '/app/$orgSlug/commutes',
          params: { orgSlug },
        });
      },
    })
  );

  return (
    <PageLayout>
      <PageLayoutTopBar startActions={<BackButton />}>
        <PageLayoutTopBarTitle>
          {t('commute:new.requestDrawer.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent containerClassName="flex flex-col gap-4">
        <p className="text-center text-sm text-muted-foreground">
          {t('commute:new.requestDrawer.description')}
        </p>
        <Calendar
          className="mx-auto"
          mode="single"
          selected={requestDate}
          onSelect={(date) => {
            if (date) {
              navigate({
                to: '.',
                search: (prev: typeof search) => ({
                  ...prev,
                  date: toNoonUTC(date),
                }),
              });
            }
          }}
          defaultMonth={requestDate}
          disabled={(date) => date < today}
          startMonth={today}
          classNames={{
            day: 'size-10',
            day_button: 'size-10',
            weekday: 'w-10',
          }}
          style={{ width: '310px' }}
        />
        <div className="flex flex-col gap-1.5">
          <Label>{t('commute:new.requestDrawer.destination')}</Label>
          <Input
            placeholder={t('commute:new.requestDrawer.destinationPlaceholder')}
            value={requestDestination}
            onChange={(e) => setRequestDestination(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          disabled={!requestDate}
          loading={commuteRequest.isPending}
          onClick={() => {
            if (requestDate) {
              commuteRequest.mutate({
                date: requestDate,
                destination: requestDestination || undefined,
              });
            }
          }}
        >
          {t('commute:new.requestDrawer.submit')}
        </Button>
      </PageLayoutContent>
    </PageLayout>
  );
};
