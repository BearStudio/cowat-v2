import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ImageIcon } from 'lucide-react';
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
  FormFieldsAccountUpdateImage,
  zFormFieldsAccountUpdateImage,
} from '@/features/account/schema';
import { authClient } from '@/features/auth/client';

export const EditImageDrawer = (props: { children: ReactElement }) => {
  const { t } = useTranslation(['account']);
  const [open, setOpen] = useState(false);
  const session = authClient.useSession();
  const form = useForm<FormFieldsAccountUpdateImage>({
    resolver: zodResolver(zFormFieldsAccountUpdateImage()),
    values: {
      image: session.data?.user.image ?? '',
    },
  });

  const updateImage = useMutation(
    orpc.account.updateImage.mutationOptions({
      onSuccess: async () => {
        await session.refetch();
        toast.success(t('account:editImageDrawer.successMessage'));
        form.reset();
        setOpen(false);
      },
      onError: () => toast.error(t('account:editImageDrawer.errorMessage')),
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
          onSubmit={async ({ image }) => {
            updateImage.mutate({ image });
          }}
          className="flex flex-col gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('account:editImageDrawer.title')}
            </ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              {t('account:editImageDrawer.description')}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel className="sr-only">
                {t('account:editImageDrawer.label')}
              </FormFieldLabel>
              <FormFieldController
                control={form.control}
                type="text"
                name="image"
                size="lg"
                startAddon={<ImageIcon />}
                autoFocus
              />
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={updateImage.isPending}
            >
              {t('account:editImageDrawer.submitButton')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
