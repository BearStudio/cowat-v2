import { cva, VariantProps } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';

import { UserBookingStatus } from '@/features/booking/status-colors';

export const bookingStatusBadgeVariants = cva('', {
  variants: {
    status: {
      DRIVER: 'default',
      REQUESTED: 'secondary',
      ACCEPTED: 'positive',
      REFUSED: 'negative',
      CANCELED: 'warning',
    } satisfies Record<
      NonNullable<Exclude<UserBookingStatus, 'OUTSIDER'>>,
      string
    >,
  },
});
export const BookingStatusBadge = ({
  status,
}: {
  status:
    | VariantProps<typeof bookingStatusBadgeVariants>['status']
    | 'OUTSIDER';
}) => {
  const { t } = useTranslation(['booking']);

  if (status === 'OUTSIDER' || !status) return null;

  return (
    <Badge
      variant={
        bookingStatusBadgeVariants({
          status,
        }) as React.ComponentProps<typeof Badge>['variant']
      }
      className="uppercase"
      size="sm"
    >
      {t(`booking:request.status.${status}`)}
    </Badge>
  );
};
