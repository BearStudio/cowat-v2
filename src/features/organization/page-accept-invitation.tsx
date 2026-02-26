import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { authClient } from '@/features/auth/client';

export const PageAcceptInvitation = ({
  invitationId,
}: {
  invitationId: string;
}) => {
  const { t } = useTranslation(['organization']);
  const navigate = useNavigate();
  const session = authClient.useSession();

  const hasMutatedRef = useRef(false);

  const { mutate, isPending, isIdle, isError, isSuccess } = useMutation({
    mutationFn: async () => {
      const result = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (result.error) {
        throw result.error;
      }

      if (result.data?.member?.organizationId) {
        await authClient.organization.setActive({
          organizationId: result.data.member.organizationId,
        });
      }

      return result.data;
    },
  });

  useEffect(() => {
    if (session.data?.user && !hasMutatedRef.current) {
      hasMutatedRef.current = true;
      mutate();
    }
  }, [session.data?.user, mutate]);

  // Redirect to login if not authenticated
  if (!session.isPending && !session.data?.user) {
    navigate({
      to: '/login',
      search: { redirect: window.location.href },
      replace: true,
    });
    return null;
  }

  // Show success as soon as the mutation completes, regardless of any
  // subsequent session re-fetch triggered by setActive().
  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <CheckCircleIcon className="text-green-500 size-12" />
        <h1 className="text-lg font-semibold">
          {t('organization:invitation.accepted')}
        </h1>
        <Button onClick={() => navigate({ to: '/app' })}>
          {t('organization:invitation.backToApp')}
        </Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <XCircleIcon className="text-red-500 size-12" />
        <h1 className="text-lg font-semibold">
          {t('organization:invitation.error')}
        </h1>
        <p className="max-w-sm text-center text-sm text-neutral-500">
          {t('organization:invitation.expired')}
        </p>
        <Button onClick={() => navigate({ to: '/app' })}>
          {t('organization:invitation.backToApp')}
        </Button>
      </div>
    );
  }

  if (isPending || isIdle || session.isPending) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Spinner className="opacity-60" />
        <p className="text-sm text-neutral-500">
          {t('organization:invitation.accepting')}
        </p>
      </div>
    );
  }
};
