import { BuildingIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import { authClient } from '@/features/auth/client';

export const PageNoOrganization = () => {
  const { t } = useTranslation(['organization', 'auth']);

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <BuildingIcon className="size-12 text-neutral-400" />
        <h1 className="text-xl font-semibold">
          {t('organization:noOrganization.title')}
        </h1>
        <p className="max-w-sm text-sm text-neutral-500">
          {t('organization:noOrganization.description')}
        </p>
      </div>
      <Button variant="secondary" onClick={handleSignOut}>
        {t('organization:noOrganization.signOut')}
      </Button>
    </div>
  );
};
