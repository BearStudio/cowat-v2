import { useFormContext } from 'react-hook-form';

import {
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { FormFieldsLocation } from '@/features/location/schema';

export const FormLocation = () => {
  const form = useFormContext<FormFieldsLocation>();

  return (
    <div className="flex flex-col gap-4">
      <FormField>
        <FormFieldLabel>Name</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="name"
          autoFocus
        />
      </FormField>
      <FormField>
        <FormFieldLabel>Address</FormFieldLabel>
        <FormFieldController
          type="text"
          control={form.control}
          name="address"
        />
      </FormField>
    </div>
  );
};
