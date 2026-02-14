import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerContent,
  ResponsiveDrawerDescription,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
  ResponsiveDrawerTrigger,
} from '@/components/ui/responsive-drawer';

import {
  FormFieldsAccountUpdatePhone,
  zFormFieldsAccountUpdatePhone,
} from '@/features/account/schema';
import { authClient } from '@/features/auth/client';

export const EditPhoneDrawer = (props: { children: ReactElement }) => {
  const { t } = useTranslation(['account']);
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();
  const form = useForm<FormFieldsAccountUpdatePhone>({
    resolver: zodResolver(zFormFieldsAccountUpdatePhone()),
    values: {
      phone: session.data?.user.phone ?? '',
    },
  });

  const updateUser = useMutation(
    orpc.account.updateInfo.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success(t('account:editPhoneDrawer.successMessage'));
        form.reset();
        setOpen(false);
      },
      onError: () => toast.error(t('account:editPhoneDrawer.errorMessage')),
    })
  );

  return (
    <ResponsiveDrawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        form.reset();
      }}
    >
      <ResponsiveDrawerTrigger render={props.children} />

      <ResponsiveDrawerContent className="sm:max-w-xs">
        <Form
          {...form}
          onSubmit={async ({ phone }) => {
            updateUser.mutate({
              name: session.data?.user.name ?? '',
              phone,
              autoAccept: session.data?.user.autoAccept ?? false,
            });
          }}
          className="flex flex-col gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('account:editPhoneDrawer.title')}
            </ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              {t('account:editPhoneDrawer.description')}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel className="sr-only">
                {t('account:editPhoneDrawer.label')}
              </FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="tel"
                name="phone"
                size="lg"
                autoFocus
              />
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={updateUser.isPending}
            >
              {t('account:editPhoneDrawer.submitButton')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
