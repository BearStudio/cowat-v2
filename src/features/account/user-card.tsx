import { CameraIcon, LogOutIcon, PenLineIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardHeader, CardTitle } from '@/components/ui/card';

import { AccountCardRow } from '@/features/account/account-card-row';
import { EditImageDrawer } from '@/features/account/edit-image-drawer';
import { EditNameDrawer } from '@/features/account/edit-name-drawer';
import { EditPhoneDrawer } from '@/features/account/edit-phone-drawer';
import { authClient } from '@/features/auth/client';
import { ConfirmSignOut } from '@/features/auth/confirm-signout';

export const UserCard = () => {
  const { t } = useTranslation(['auth', 'account']);
  const session = authClient.useSession();

  return (
    <Card className="gap-0 p-0">
      <CardHeader className="gap-y-0 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <EditImageDrawer>
            <button
              type="button"
              className="group relative cursor-pointer rounded-full"
            >
              <Avatar size="xl">
                <AvatarImage
                  src={session.data?.user.image ?? undefined}
                  alt={session.data?.user.name ?? ''}
                />
                <AvatarFallback
                  variant="boring"
                  name={session.data?.user.name ?? ''}
                />
              </Avatar>
              <span className="absolute right-0 bottom-0 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background">
                <CameraIcon className="size-3" />
              </span>
            </button>
          </EditImageDrawer>
          <EditNameDrawer>
            <button
              type="button"
              className="group flex min-w-0 items-center gap-1.5"
            >
              <CardTitle className="truncate">
                {session.data?.user.name || session.data?.user.email || (
                  <span className="text-xs text-muted-foreground">--</span>
                )}
              </CardTitle>
              <PenLineIcon className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100" />
              <span className="sr-only">
                {t('account:userCard.name.updateAction')}
              </span>
            </button>
          </EditNameDrawer>
        </div>
        <CardAction>
          <ConfirmSignOut>
            <Button size="sm" variant="ghost">
              <LogOutIcon />
              {t('auth:signOut.action')}
            </Button>
          </ConfirmSignOut>
        </CardAction>
      </CardHeader>

      <AccountCardRow label={t('account:userCard.email.label')}>
        <p className="flex-1 truncate underline-offset-4">
          {!session.data?.user.emailVerified && (
            <Badge size="sm" variant="warning" className="me-2">
              {t('account:userCard.email.notVerified')}
            </Badge>
          )}
          {session.data?.user.email || (
            <span className="text-xs text-muted-foreground">--</span>
          )}
        </p>
      </AccountCardRow>
      <AccountCardRow label={t('account:userCard.phone.label')}>
        <EditPhoneDrawer>
          <Button variant="link" size="sm" className="-my-1.5">
            <span className="truncate">
              {session.data?.user.phone || (
                <span className="text-xs text-muted-foreground">--</span>
              )}
            </span>
            <PenLineIcon className="size-3" />
            <span className="sr-only">
              {t('account:userCard.phone.updateAction')}
            </span>
          </Button>
        </EditPhoneDrawer>
      </AccountCardRow>
    </Card>
  );
};
