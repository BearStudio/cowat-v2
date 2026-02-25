import { PencilIcon, PhoneIcon, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';
import { ResponsiveIconButton } from '@/components/ui/responsive-icon-button';

import { OrgButtonLink } from '@/features/organization/org-button-link';

type CardCommuteActionsProps = {
  isDriver: boolean;
  commuteId: string;
  driverPhone?: string | null;
  cancelConfirmDescription: ReactNode;
  onCancel: () => void | Promise<void>;
};

export function CardCommuteActions({
  isDriver,
  commuteId,
  driverPhone,
  cancelConfirmDescription,
  onCancel,
}: CardCommuteActionsProps) {
  const { t } = useTranslation(['commute', 'common']);

  return (
    <div className="ms-auto flex items-center gap-2">
      {isDriver && (
        <>
          <OrgButtonLink
            size="sm"
            variant="secondary"
            to="/app/$orgSlug/commutes/$id/update"
            params={{ id: commuteId }}
          >
            <PencilIcon />
            {t('commute:list.editAction')}
          </OrgButtonLink>
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
