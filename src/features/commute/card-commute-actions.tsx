import { PencilIcon, PhoneIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

type CardCommuteActionsProps = {
  isDriver: boolean;
  driverPhone?: string | null;
  cancelConfirmDescription: string;
  onCancel: () => void | Promise<void>;
};

export function CardCommuteActions({
  isDriver,
  driverPhone,
  cancelConfirmDescription,
  onCancel,
}: CardCommuteActionsProps) {
  const { t } = useTranslation(['commute', 'common']);

  return (
    <div className="flex items-center gap-2">
      {isDriver && (
        <>
          <Button size="sm" variant="secondary">
            <PencilIcon />
            {t('commute:list.editAction')}
          </Button>
          <ConfirmResponsiveDrawer
            description={cancelConfirmDescription}
            confirmText={t('common:actions.delete')}
            confirmVariant="destructive"
            onConfirm={onCancel}
          >
            <Button size="sm" variant="destructive">
              <Trash2 />
              {t('commute:list.cancelAction')}
            </Button>
          </ConfirmResponsiveDrawer>
        </>
      )}
      {!isDriver && driverPhone && (
        <Button
          size="sm"
          variant="secondary"
          render={<a href={`tel:${driverPhone}`} />}
        >
          <PhoneIcon />
          {t('commute:list.callDriver')}
        </Button>
      )}
    </div>
  );
}
