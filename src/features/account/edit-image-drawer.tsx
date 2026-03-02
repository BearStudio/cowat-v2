import { useMutation } from '@tanstack/react-query';
import { ImageIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';
import { toast } from '@/lib/toast';

import { EditAccountFieldDrawer } from '@/features/account/edit-account-field-drawer';
import { zFormFieldsAccountUpdateImage } from '@/features/account/schema';
import { authClient } from '@/features/auth/client';

export const EditImageDrawer = (props: { children: ReactElement }) => {
  const { t } = useTranslation(['account']);
  const session = authClient.useSession();

  const updateImage = useMutation(
    orpc.account.updateImage.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success(t('account:editImageDrawer.successMessage'));
      },
      onError: () => toast.error(t('account:editImageDrawer.errorMessage')),
    })
  );

  return (
    <EditAccountFieldDrawer
      schema={zFormFieldsAccountUpdateImage()}
      values={{ image: session.data?.user.image ?? '' }}
      onSubmit={({ image }) => updateImage.mutate({ image })}
      isPending={updateImage.isPending}
      labels={{
        title: t('account:editImageDrawer.title'),
        description: t('account:editImageDrawer.description'),
        field: t('account:editImageDrawer.label'),
        submit: t('account:editImageDrawer.submitButton'),
      }}
      fieldName="image"
      startAddon={<ImageIcon />}
    >
      {props.children}
    </EditAccountFieldDrawer>
  );
};
