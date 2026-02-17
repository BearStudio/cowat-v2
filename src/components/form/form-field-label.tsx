import { ComponentProps } from 'react';

import { Label } from '@/components/ui/label';

import { useFormField } from './form-field';

type FormFieldLabelProps = Omit<ComponentProps<'label'>, 'id' | 'htmlFor'> & {
  required?: boolean;
};

export const FormFieldLabel = ({
  required,
  children,
  ...props
}: FormFieldLabelProps) => {
  const ctx = useFormField();
  return (
    <Label {...props} id={ctx.labelId} htmlFor={ctx.id}>
      {children}
      {required && <span className="text-red-500">*</span>}
    </Label>
  );
};
