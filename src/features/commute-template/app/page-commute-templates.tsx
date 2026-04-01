import { getUiState } from '@bearstudio/ui-state';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { PlusIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { featureIcons } from '@/lib/feature-icons';
import { orpc } from '@/lib/orpc/client';

import { BackButton } from '@/components/back-button';
import { CardListSkeleton } from '@/components/loading/card-list-skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import { DataListErrorState } from '@/components/ui/datalist';
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import { CardCommuteStopsList } from '@/features/commute/card-commute-stops-list';
import { CardCommuteTemplateHeader } from '@/features/commute-template/card-commute-template-header';
import { OrgButtonLink } from '@/features/organization/org-button-link';
import { useShouldShowNav } from '@/layout/app/layout';
import {
  PageLayout,
  PageLayoutContent,
  PageLayoutTopBar,
  PageLayoutTopBarTitle,
} from '@/layout/app/page-layout';

export const commuteTemplatesInfiniteOptions = () =>
  orpc.commuteTemplate.getAll.infiniteOptions({
    input: (cursor: string | undefined) => ({
      cursor,
    }),
    initialPageParam: undefined,
    maxPages: 10,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

export const PageCommuteTemplates = ({ orgSlug }: { orgSlug: string }) => {
  const { t } = useTranslation(['commuteTemplate', 'common']);
  const navigate = useNavigate();

  useShouldShowNav('desktop-only');
  const templatesQuery = useInfiniteQuery(commuteTemplatesInfiniteOptions());

  const templateDelete = useMutation(
    orpc.commuteTemplate.delete.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        toast.success(t('commuteTemplate:list.deleteSuccessMessage'));
        await context.client.invalidateQueries({
          queryKey: orpc.commuteTemplate.getAll.key(),
          type: 'all',
        });
      },
    })
  );

  const ui = getUiState((set) => {
    if (templatesQuery.status === 'pending') return set('pending');
    if (templatesQuery.status === 'error') return set('error');
    const items = templatesQuery.data?.pages.flatMap((p) => p.items) ?? [];
    if (!items.length) return set('empty');
    return set('default', { items });
  });

  return (
    <PageLayout>
      <PageLayoutTopBar
        className="[view-transition-name:none]"
        startActions={<BackButton viewTransition={{ types: ['slide-down'] }} />}
        endActions={
          <OrgButtonLink
            variant="secondary"
            size="sm"
            to="/app/$orgSlug/account/commute-templates/new"
          >
            <PlusIcon />
            {t('commuteTemplate:list.newAction')}
          </OrgButtonLink>
        }
      >
        <PageLayoutTopBarTitle>
          {t('commuteTemplate:list.title')}
        </PageLayoutTopBarTitle>
      </PageLayoutTopBar>
      <PageLayoutContent>
        {ui
          .match('pending', () => <CardListSkeleton />)
          .match('error', () => (
            <DataListErrorState retry={() => templatesQuery.refetch()} />
          ))
          .match('empty', () => (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <featureIcons.CommuteTemplates />
                </EmptyMedia>
                <EmptyTitle>{t('commuteTemplate:list.emptyState')}</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <OrgButtonLink
                  variant="secondary"
                  size="sm"
                  to="/app/$orgSlug/account/commute-templates/new"
                >
                  <PlusIcon />
                  {t('commuteTemplate:list.newAction')}
                </OrgButtonLink>
              </EmptyContent>
            </Empty>
          ))
          .match('default', ({ items }) => (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: '/app/$orgSlug/account/commute-templates/$id/update',
                      params: { orgSlug, id: item.id },
                    })
                  }
                >
                  <CardHeader>
                    <CardCommuteTemplateHeader
                      name={item.name}
                      type={item.type}
                      stopsCount={item.stops.length}
                      seats={item.seats}
                      actions={
                        <div onClick={(e) => e.stopPropagation()}>
                          <ConfirmResponsiveDrawer
                            title={item.name}
                            description={t(
                              'commuteTemplate:list.deleteConfirmDescription'
                            )}
                            confirmText={t('common:actions.delete')}
                            confirmVariant="destructive"
                            icon={<featureIcons.CommuteTemplates />}
                            onConfirm={() =>
                              templateDelete.mutateAsync({ id: item.id })
                            }
                          >
                            <ResponsiveIconButton
                              variant="ghost"
                              size="sm"
                              label={t('common:actions.delete')}
                            >
                              <Trash2 />
                            </ResponsiveIconButton>
                          </ConfirmResponsiveDrawer>
                        </div>
                      }
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {item.comment && (
                        <p className="text-sm text-muted-foreground">
                          {item.comment}
                        </p>
                      )}
                      {/* Templates don't have passengers, so we pass them as empty */}
                      <CardCommuteStopsList
                        stops={item.stops.map((stop) => ({
                          ...stop,
                          commuteId: '',
                          passengers: [],
                        }))}
                        disableLinks
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {templatesQuery.hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => templatesQuery.fetchNextPage()}
                    loading={templatesQuery.isFetchingNextPage}
                  >
                    {t('commuteTemplate:list.loadMore')}
                  </Button>
                </div>
              )}
            </div>
          ))
          .exhaustive()}
      </PageLayoutContent>
    </PageLayout>
  );
};
