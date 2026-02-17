import { Control, SetFieldValue } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';
import { Checkbox } from '@/components/ui/checkbox';

import { FormFieldStops } from '@/features/commute/form-field-stops';
import { FormFieldsCommute } from '@/features/commute/schema';

type FormCommuteSharedFieldsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: SetFieldValue<any>;
  ns: 'commute' | 'commuteTemplate';
  defaultStop: FormFieldsCommute['stops'][number];
};

export const FormCommuteSharedFields = ({
  control,
  setValue,
  ns,
  defaultStop,
}: FormCommuteSharedFieldsProps) => {
  const { t } = useTranslation([ns]);

  return (
    <>
      <FormField>
        <FormFieldLabel required>{t(`${ns}:form.seats`)}</FormFieldLabel>
        <FormFieldController
          type="number"
          control={control}
          name="seats"
          min={1}
          buttons="mobile"
        />
      </FormField>

      <FormFieldController
        type="custom"
        control={control}
        name="type"
        render={({ field }) => (
          <Checkbox
            checked={field.value === 'ROUND'}
            onCheckedChange={(checked) =>
              field.onChange(checked ? 'ROUND' : 'ONEWAY')
            }
          >
            {t(`${ns}:form.roundTrip`)}
          </Checkbox>
        )}
      />

      <FormFieldStops
        control={control}
        setValue={setValue}
        ns={ns}
        defaultStop={defaultStop}
      />

      <FormField>
        <FormFieldLabel>{t(`${ns}:form.comment`)}</FormFieldLabel>
        <FormFieldController
          type="textarea"
          control={control}
          name="comment"
          placeholder={t(`${ns}:form.commentPlaceholder`)}
        />
      </FormField>
    </>
  );
};
