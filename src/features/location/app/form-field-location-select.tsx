import { zodResolver } from '@hookform/resolvers/zod';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { ComponentProps, useState } from 'react';
import {
  FieldPath,
  FieldValues,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  ResponsiveDrawerClose,
  ResponsiveDrawerContent,
  ResponsiveDrawerFooter,
  ResponsiveDrawerHeader,
  ResponsiveDrawerTitle,
} from '@/components/ui/responsive-drawer';

import { FormLocation } from '@/features/location/app/form-location';
import {
  FormFieldsLocation,
  zFormFieldsLocation,
} from '@/features/location/schema';

type FormFieldLocationSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: UseFormReturn<TFieldValues>['control'];
  name: TName;
  label?: string;
  placeholder?: string;
  setValue: UseFormReturn<TFieldValues>['setValue'];
} & Omit<ComponentProps<typeof FormField>, 'children'>;

export const FormFieldLocationSelect = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  setValue,
  ...formFieldProps
}: FormFieldLocationSelectProps<TFieldValues, TName>) => {
  const { t } = useTranslation(['commute']);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const locationsQuery = useInfiniteQuery(
    orpc.location.getAll.infiniteOptions({
      input: (cursor: string | undefined) => ({ cursor, limit: 100 }),
      initialPageParam: undefined,
      maxPages: 1,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })
  );

  const locationItems =
    locationsQuery.data?.pages.flatMap((p) =>
      p.items.map((loc) => ({ label: loc.name, value: loc.id }))
    ) ?? [];

  return (
    <>
      <FormField {...formFieldProps}>
        <FormFieldLabel required>
          {label ?? t('commute:form.location')}
        </FormFieldLabel>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <FormFieldController
              type="combobox"
              control={control}
              name={name}
              items={locationItems}
              placeholder={placeholder ?? t('commute:form.locationPlaceholder')}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setIsDrawerOpen(true)}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </FormField>

      <CreateLocationDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onCreated={(locationId) => {
          setValue(name, locationId as TFieldValues[TName], {
            shouldValidate: true,
          });
          setIsDrawerOpen(false);
        }}
      />
    </>
  );
};

const CreateLocationDrawer = ({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (locationId: string) => void;
}) => {
  const { t } = useTranslation(['location', 'common']);

  const form = useForm<FormFieldsLocation>({
    resolver: zodResolver(zFormFieldsLocation()),
    values: {
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
        form.reset();
        onCreated(data.id);
      },
    })
  );

  return (
    <ResponsiveDrawer open={open} onOpenChange={onOpenChange}>
      <ResponsiveDrawerContent>
        <Form
          {...form}
          onSubmit={(values) => locationCreate.mutate(values)}
          className="gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>
              {t('location:new.title')}
            </ResponsiveDrawerTitle>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormLocation />
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <ResponsiveDrawerClose
              render={<Button variant="secondary" className="max-sm:w-full" />}
            >
              {t('common:actions.cancel')}
            </ResponsiveDrawerClose>
            <Button
              type="submit"
              className="max-sm:w-full"
              loading={locationCreate.isPending}
            >
              {t('location:new.submitButton')}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
};
