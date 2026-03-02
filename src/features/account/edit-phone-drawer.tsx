import { useMutation } from '@tanstack/react-query';
import { PhoneIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { EditAccountFieldDrawer } from '@/features/account/edit-account-field-drawer';
import { zFormFieldsAccountUpdatePhone } from '@/features/account/schema';
import { authClient } from '@/features/auth/client';

export const EditPhoneDrawer = (props: { children: ReactElement }) => {
  const { t } = useTranslation(['account']);
  const session = authClient.useSession();

  const updateUser = useMutation(
    orpc.account.updateInfo.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success(t('account:editPhoneDrawer.successMessage'));
      },
      onError: () => toast.error(t('account:editPhoneDrawer.errorMessage')),
    })
  );

  return (
    <EditAccountFieldDrawer
      schema={zFormFieldsAccountUpdatePhone()}
      values={{ phone: session.data?.user.phone ?? '' }}
      onSubmit={({ phone }) =>
        updateUser.mutate({
          name: session.data?.user.name ?? '',
          phone,
        })
      }
      isPending={updateUser.isPending}
      labels={{
        title: t('account:editPhoneDrawer.title'),
        description: t('account:editPhoneDrawer.description'),
        field: t('account:editPhoneDrawer.label'),
        submit: t('account:editPhoneDrawer.submitButton'),
      }}
      fieldName="phone"
      fieldType="tel"
      startAddon={<PhoneIcon />}
    >
      {props.children}
    </EditAccountFieldDrawer>
  );
};
