import { useMutation } from '@tanstack/react-query';
import {
  MapPinIcon,
  MessageCircleIcon,
  NavigationIcon,
  PencilIcon,
  PhoneIcon,
  Trash2,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Button } from '@/components/ui/button';
import { ConfirmResponsiveDrawer } from '@/components/ui/confirm-responsive-drawer';

import { CommuteEnriched } from '@/features/commute/schema';
import { OrgButtonLink } from '@/features/organization/org-button-link';

type CardCommuteActionsProps = {
  commute: CommuteEnriched;
  currentUserId: string;

  isDriver: boolean;
  commuteId: string;
  driverPhone?: string | null;
  cancelConfirmDescription: ReactNode;
  onCancel: () => void | Promise<void>;
};

export function CardCommuteActions({
  commute,
  currentUserId,
  isDriver,
  commuteId,
  cancelConfirmDescription,
  onCancel,
}: CardCommuteActionsProps) {
  const { t } = useTranslation(['commute', 'common', 'upcomingCommute']);

  const stops = [...commute.stops].sort((a, b) => a.order - b.order);

  const passengerStop = stops.find((stop) =>
    stop.passengers?.some((p) => p.passenger?.id === currentUserId)
  );

  const sendAlert = useMutation(
    orpc.commute.sendAlert.mutationOptions({
      onSuccess: () =>
        toast.success(t('upcomingCommute:dialog.message.toast.success')),
      onError: () =>
        toast.error(t('upcomingCommute:dialog.message.toast.error')),
    })
  );

  const [customMessage, setCustomMessage] = useState('');

  return (
    <div className="-mx-4 flex flex-col gap-2 border-t px-4 pt-2 pb-0">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          {t('upcomingCommute:dialog.message.late')}
        </p>
        <div className="flex gap-2">
          {[5, 10, 15].map((min) => (
            <Button
              key={min}
              className="flex-1"
              size="sm"
              variant="secondary"
              onClick={() =>
                sendAlert.mutate({
                  id: commute.id,
                  alertType: 'late',
                  lateMinutes: min,
                })
              }
            >
              +{min} min
            </Button>
          ))}
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="w-full justify-start gap-2"
          onClick={() =>
            sendAlert.mutate({
              id: commute.id,
              alertType: 'arrived',
            })
          }
        >
          <MapPinIcon className="size-4 shrink-0" />
          {t('upcomingCommute:dialog.message.button.arrived')}
        </Button>

        {!isDriver && (
          <>
            {passengerStop?.location?.address && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full justify-start gap-2"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      passengerStop.location.address
                    )}`,
                    '_blank'
                  )
                }
              >
                <NavigationIcon className="size-4 shrink-0" />
                {t('upcomingCommute:dialog.message.button.adress')}
              </Button>
            )}

            {commute.driver?.phone && (
              <Button
                size="sm"
                variant="secondary"
                className="gap-f2 w-full justify-start"
                onClick={() => window.open(`tel:${commute.driver.phone}`)}
              >
                <PhoneIcon className="size-4 shrink-0" />
                {t('upcomingCommute:dialog.message.button.call')}
              </Button>
            )}
          </>
        )}

        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            {t('upcomingCommute:dialog.message.custom')}
          </p>
          <textarea
            className="h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder={t('upcomingCommute:dialog.message.customArea')}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />

          <Button
            className="gap-2 self-end"
            size="sm"
            disabled={!customMessage.trim() || sendAlert.isPending}
            onClick={() => {
              sendAlert.mutate(
                {
                  id: commute.id,
                  alertType: 'custom',
                  customMessage: customMessage.trim(),
                },
                {
                  onSuccess: () => setCustomMessage(''),
                }
              );
            }}
          >
            <MessageCircleIcon className="size-4 shrink-0" />
            {t('upcomingCommute:dialog.message.button.send')}
          </Button>
        </div>
      </div>

      {isDriver && (
        <div className="-mx-4 border-t px-4 pt-3 pb-0">
          <div className="flex items-center justify-between gap-2">
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
              confirmText={t('common:actions.confirm')}
              confirmVariant="destructive"
              onConfirm={onCancel}
            >
              <Button size="sm" variant="destructive-secondary">
                <Trash2 />
                {t('commute:list.cancelAction')}
              </Button>
            </ConfirmResponsiveDrawer>
          </div>
        </div>
      )}
    </div>
  );
}
