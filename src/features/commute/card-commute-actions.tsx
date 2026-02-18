import { PencilIcon, PhoneIcon, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

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
    <div className="ms-auto flex items-center gap-2">
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
            <Button size="sm" variant="destructive-secondary">
              <Trash2 />
              {t('commute:list.cancelAction')}
            </Button>
          </ConfirmResponsiveDrawer>
        </>
      )}
      {!isDriver && driverPhone && (
        <ResponsiveIconButton
          size="sm"
          variant="secondary"
          nativeButton={false}
          label={t('commute:list.callDriver')}
          render={<a href={`tel:${driverPhone}`} />}
        >
          <PhoneIcon />
        </ResponsiveIconButton>
      )}
    </div>
  );
}
