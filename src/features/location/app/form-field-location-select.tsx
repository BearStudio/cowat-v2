import { useInfiniteQuery } from '@tanstack/react-query';
import { ComponentProps } from 'react';
import { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { orpc } from '@/lib/orpc/client';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

type FormFieldLocationSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: UseFormReturn<TFieldValues>['control'];
  name: TName;
  label?: string;
  placeholder?: string;
} & Omit<ComponentProps<typeof FormField>, 'children'>;

export const FormFieldLocationSelect = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  ...formFieldProps
}: FormFieldLocationSelectProps<TFieldValues, TName>) => {
  const { t } = useTranslation(['commute']);

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
    <FormField {...formFieldProps}>
      <FormFieldLabel>{label ?? t('commute:form.location')}</FormFieldLabel>
      <FormFieldController
        type="combobox"
        control={control}
        name={name}
        items={locationItems}
        placeholder={placeholder ?? t('commute:form.locationPlaceholder')}
      />
    </FormField>
  );
};
