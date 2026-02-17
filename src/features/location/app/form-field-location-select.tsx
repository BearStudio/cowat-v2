import { useInfiniteQuery } from '@tanstack/react-query';
import { PlusIcon } from 'lucide-react';
import { ComponentProps, useState } from 'react';
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Button } from '@/components/ui/button';

import { LocationDrawer } from '@/features/location/app/location-drawer';

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
  const { t } = useTranslation(['commute', 'location']);
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
            <span className="sr-only">{t('location:new.title')}</span>
            <PlusIcon className="size-4" />
          </Button>
        </div>
      </FormField>

      <LocationDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onCreated={(locationId) => {
          setValue(name, locationId as TFieldValues[TName], {
            shouldValidate: true,
          });
        }}
      />
    </>
  );
};
