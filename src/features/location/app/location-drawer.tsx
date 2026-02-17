import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { orpc } from '@/lib/orpc/client';

import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDrawer,
  ResponsiveDrawerBody,
  ResponsiveDrawerClose,
  ResponsiveDrawerContent,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/components/ui/responsive-drawer';
import { Skeleton } from '@/components/ui/skeleton';

import { FormLocation } from '@/features/location/app/form-location';
import {
  FormFieldsLocation,
  zFormFieldsLocation,
} from '@/features/location/schema';

export const LocationDrawer = ({
  open,
  onOpenChange,
  locationId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId?: string | null;
  onCreated?: (locationId: string) => void;
}) => {
  const { t } = useTranslation(['location', 'common']);
  const isUpdate = !!locationId;

  const locationQuery = useQuery(
    orpc.location.getById.queryOptions({
      input: { id: locationId! },
      enabled: isUpdate && open,
    })
  );

  const form = useForm<FormFieldsLocation>({
    resolver: zodResolver(zFormFieldsLocation()),
    values: isUpdate
      ? {
          name: locationQuery.data?.name ?? '',
          address: locationQuery.data?.address ?? '',
        }
      : {
          name: '',
          address: '',
        },
  });

  const locationCreate = useMutation(
    orpc.location.create.mutationOptions({
      onSuccess: async (data, _variables, _onMutateResult, context) => {
        await context.client.invalidateQueries({
          queryKey: orpc.location.getAll.key(),
          type: 'all',
        });
        toast.success(t('location:new.successMessage'));
        form.reset();
        if (onCreated) {
          onCreated(data.id);
        }
        onOpenChange(false);
      },
    })
  );

  const locationUpdate = useMutation(
    orpc.location.update.mutationOptions({
      onSuccess: async (_data, _variables, _onMutateResult, context) => {
        await Promise.all([
          context.client.invalidateQueries({
            queryKey: orpc.location.getById.key({
              input: { id: locationId! },
            }),
          }),
          context.client.invalidateQueries({
            queryKey: orpc.location.getAll.key(),
            type: 'all',
          }),
        ]);
        toast.success(t('location:update.successMessage'));
        onOpenChange(false);
      },
    })
  );

  const isPending = locationCreate.isPending || locationUpdate.isPending;

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <ResponsiveDrawerContent>
        <Form
          {...form}
          onSubmit={(values) => {
            if (isUpdate) {
              locationUpdate.mutate({
                id: locationId,
                name: values.name,
                address: values.address,
              });
            } else {
              locationCreate.mutate(values);
            }
          }}
          className="gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {isUpdate ? t('location:update.title') : t('location:new.title')}
            </ResponsiveDrawerTitle>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            {isUpdate && locationQuery.isPending ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <FormLocation />
            )}
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <ResponsiveDrawerClose
              render={<Button variant="secondary" className="max-sm:w-full" />}
            >
              {t('common:actions.cancel')}
            </ResponsiveDrawerClose>
            <Button type="submit" className="max-sm:w-full" loading={isPending}>
              {isUpdate
                ? t('location:update.submitButton')
                : t('location:new.submitButton')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
