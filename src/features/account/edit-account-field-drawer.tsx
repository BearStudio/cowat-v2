import { zodResolver } from '@hookform/resolvers/zod';
import { ReactElement, ReactNode, useState } from 'react';
import { FieldValues, Path, useForm } from 'react-hook-form';
import { ZodObject, ZodRawShape } from 'zod';

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

type EditAccountFieldDrawerProps<T extends FieldValues> = {
  children: ReactElement;
  schema: ZodObject<ZodRawShape>;
  values: T;
  onSubmit: (values: T) => void;
  isPending: boolean;
  labels: {
    title: string;
    description: string;
    field: string;
    submit: string;
  };
  fieldName: Path<T>;
  fieldType?: 'text' | 'tel';
  startAddon?: ReactNode;
};

export function EditAccountFieldDrawer<T extends FieldValues>({
  children,
  schema,
  values,
  onSubmit,
  isPending,
  labels,
  fieldName,
  fieldType = 'text',
  startAddon,
}: EditAccountFieldDrawerProps<T>) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    values,
  });

  return (
    <ResponsiveDrawer
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        form.reset();
      }}
    >
      <ResponsiveDrawerTrigger render={children} />

      <ResponsiveDrawerContent className="sm:max-w-xs">
        <Form
          {...form}
          onSubmit={(formValues) => {
            onSubmit(formValues as T);
            form.reset();
            setOpen(false);
          }}
          className="flex flex-col gap-4"
        >
          <ResponsiveDrawerHeader>
            <ResponsiveDrawerTitle>{labels.title}</ResponsiveDrawerTitle>
            <ResponsiveDrawerDescription className="sr-only">
              {labels.description}
            </ResponsiveDrawerDescription>
          </ResponsiveDrawerHeader>
          <ResponsiveDrawerBody>
            <FormField>
              <FormFieldLabel className="sr-only">
                {labels.field}
              </FormFieldLabel>
              <FormFieldController
                control={form.control}
                type={fieldType}
                name={fieldName}
                size="lg"
                startAddon={startAddon}
                autoFocus
              />
            </FormField>
          </ResponsiveDrawerBody>
          <ResponsiveDrawerFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isPending}
            >
              {labels.submit}
            </Button>
          </ResponsiveDrawerFooter>
        </Form>
      </ResponsiveDrawerContent>
    </ResponsiveDrawer>
  );
}
