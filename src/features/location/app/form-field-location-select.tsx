import { PlusIcon } from 'lucide-react';
import { ComponentProps, useMemo, useState } from 'react';
import {
  Control,
  FieldPath,
  FieldValues,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { FormFieldContainer } from '@/components/form/form-field-container';
import { FormFieldError } from '@/components/form/form-field-error';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from '@/components/ui/combobox';

import { LocationDrawer } from '@/features/location/app/location-drawer';
import { useAllLocations } from '@/features/location/use-all-locations';

type LocationItem = {
  label: string;
  value: string;
};

type FormFieldLocationSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  setValue: UseFormReturn<TFieldValues>['setValue'];
  excludeLocationIds?: string[];
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
  excludeLocationIds,
  ...formFieldProps
}: FormFieldLocationSelectProps<TFieldValues, TName>) => {
  const { t } = useTranslation(['commute', 'location']);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { personalQuery, orgQuery } = useAllLocations();

  const { allItems, orgItems, personalItems } = useMemo(() => {
    const excluded = new Set(excludeLocationIds);

    const org = (orgQuery.data?.pages.flatMap((p) => p.items) ?? [])
      .filter((loc) => !excluded.has(loc.id))
      .map((loc) => ({ label: loc.name, value: loc.id }));

    const personal = (personalQuery.data?.pages.flatMap((p) => p.items) ?? [])
      .filter((loc) => !excluded.has(loc.id))
      .map((loc) => ({ label: loc.name, value: loc.id }));

    return {
      allItems: [...org, ...personal],
      orgItems: org,
      personalItems: personal,
    };
  }, [orgQuery.data, personalQuery.data, excludeLocationIds]);

  return (
    <>
      <FormField {...formFieldProps}>
        <FormFieldLabel required>
          {label ?? t('commute:form.location')}
        </FormFieldLabel>
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <FormFieldController
              type="custom"
              control={control}
              name={name}
              render={({ field, fieldState }) => (
                <FormFieldContainer>
                  <Combobox
                    items={allItems}
                    disabled={field.disabled}
                    value={
                      allItems.find((item) => item.value === field.value) ??
                      null
                    }
                    isItemEqualToValue={(a, b) =>
                      (a as LocationItem).value === (b as LocationItem).value
                    }
                    itemToStringLabel={(item) =>
                      (item as LocationItem).label ?? ''
                    }
                    itemToStringValue={(item) => (item as LocationItem).value}
                    onValueChange={(item) => {
                      const typedItem = item as LocationItem | null;
                      field.onChange(typedItem?.value ?? null);
                    }}
                    inputRef={field.ref}
                  >
                    <ComboboxInput
                      disabled={field.disabled}
                      onBlur={field.onBlur}
                      placeholder={
                        placeholder ?? t('commute:form.locationPlaceholder')
                      }
                      aria-invalid={fieldState.invalid ? true : undefined}
                    />
                    <ComboboxContent>
                      <ComboboxEmpty>
                        {t('location:select.noResults')}
                      </ComboboxEmpty>
                      <ComboboxList>
                        {orgItems.length > 0 && (
                          <ComboboxGroup>
                            <ComboboxLabel>
                              {t('location:select.orgGroup')}
                            </ComboboxLabel>
                            {orgItems.map((item) => (
                              <ComboboxItem key={item.value} value={item}>
                                {item.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                        )}
                        {orgItems.length > 0 && personalItems.length > 0 && (
                          <ComboboxSeparator />
                        )}
                        {personalItems.length > 0 && (
                          <ComboboxGroup>
                            <ComboboxLabel>
                              {t('location:select.personalGroup')}
                            </ComboboxLabel>
                            {personalItems.map((item) => (
                              <ComboboxItem key={item.value} value={item}>
                                {item.label}
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                  <FormFieldError />
                </FormFieldContainer>
              )}
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
          setValue(name, locationId as PathValue<TFieldValues, TName>, {
            shouldValidate: true,
          });
        }}
      />
    </>
  );
};
