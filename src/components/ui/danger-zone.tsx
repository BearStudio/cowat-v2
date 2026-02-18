import { Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

export const DangerZone = (props: { children: React.ReactNode }) => {
  const { t } = useTranslation(['components']);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">
        {t('components:dangerZoneCard.title')}
      </h3>
      <Card className="border-negative-600 dark:border-negative-400">
        <div className="flex flex-col">{props.children}</div>
      </Card>
    </div>
  );
};

export const DangerZoneCardItem = (props: {
  title: React.ReactNode;
  description: React.ReactNode;
  confirmDescription: React.ReactNode;
  confirmText: React.ReactNode;
  onConfirm: () => unknown | Promise<unknown>;
  isPending?: boolean;
}) => {
  return (
    <div className="flex flex-col justify-between gap-4 border-t px-4 py-3 first:border-t-0 sm:flex-row sm:items-center">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">{props.title}</h4>
        <p className="text-sm font-light">{props.description}</p>
      </div>
      <ConfirmResponsiveDrawer
        description={props.confirmDescription}
        confirmText={props.confirmText}
        confirmVariant="destructive-secondary"
        onConfirm={props.onConfirm}
      >
        <Button
          variant="destructive-secondary"
          size="sm"
          loading={props.isPending}
          className="shrink-0"
        >
          <Trash2Icon className="size-4" />
          {props.confirmText}
        </Button>
      </ConfirmResponsiveDrawer>
    </div>
  );
};
