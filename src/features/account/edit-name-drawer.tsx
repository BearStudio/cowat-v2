import { useMutation } from '@tanstack/react-query';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';
import { toast } from '@/lib/toast';

import { EditAccountFieldDrawer } from '@/features/account/edit-account-field-drawer';
import { zFormFieldsAccountUpdateName } from '@/features/account/schema';
import { authClient } from '@/features/auth/client';

export const EditNameDrawer = (props: { children: ReactElement }) => {
  const { t } = useTranslation(['account']);
  const session = authClient.useSession();

  const updateUser = useMutation(
    orpc.account.updateInfo.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success(t('account:editNameDrawer.successMessage'));
      },
      onError: () => toast.error(t('account:editNameDrawer.errorMessage')),
    })
  );

  return (
    <EditAccountFieldDrawer
      schema={zFormFieldsAccountUpdateName()}
      values={{ name: session.data?.user.name ?? '' }}
      onSubmit={({ name }) =>
        updateUser.mutate({
          name,
          phone: session.data?.user.phone ?? null,
        })
      }
      isPending={updateUser.isPending}
      labels={{
        title: t('account:editNameDrawer.title'),
        description: t('account:editNameDrawer.description'),
        field: t('account:editNameDrawer.label'),
        submit: t('account:editNameDrawer.submitButton'),
      }}
      fieldName="name"
    >
      {props.children}
    </EditAccountFieldDrawer>
  );
};
