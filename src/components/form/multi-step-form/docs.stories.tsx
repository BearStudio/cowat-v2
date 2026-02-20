import { Meta } from '@storybook/react-vite';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldError,
  FormFieldLabel,
} from '@/components/form';
import { onSubmit } from '@/components/form/docs.utils';

import {
  MultiStepForm,
  MultiStepFormContent,
  MultiStepFormNavigation,
  MultiStepFormStep,
  useMultiStepForm,
  useMultiStepForms,
} from '.';

export default {
  title: 'Form/MultiStepForm',
} satisfies Meta;

export const Default = () => {
  return (
    <div className="flex max-w-md flex-col overflow-hidden rounded-lg border border-border">
      <MultiStepForm>
        <MultiStepFormContent className="p-4" />

        <MultiStepFormStep label="Personal info">
          <div className="flex flex-col gap-3 px-4 pb-2">
            <input
              className="rounded-md border border-border px-3 py-2 text-sm"
              placeholder="Full name"
              aria-label="Full name"
            />
            <input
              className="rounded-md border border-border px-3 py-2 text-sm"
              placeholder="Email"
              aria-label="Email"
            />
          </div>
        </MultiStepFormStep>

        <MultiStepFormStep label="Address">
          <div className="flex flex-col gap-3 px-4 pb-2">
            <input
              className="rounded-md border border-border px-3 py-2 text-sm"
              placeholder="Street"
              aria-label="Street"
            />
            <input
              className="rounded-md border border-border px-3 py-2 text-sm"
              placeholder="City"
              aria-label="City"
            />
          </div>
        </MultiStepFormStep>

        <MultiStepFormStep label="Review">
          <div className="px-4 pb-2 text-sm text-muted-foreground">
            All looks good — ready to submit!
          </div>
        </MultiStepFormStep>

        <MultiStepFormNavigation
          onSubmit={() => onSubmit({})}
          submitLabel="Submit"
          nextLabel="Next"
          backLabel="Back"
        />
      </MultiStepForm>
    </div>
  );
};

export const WithValidation = () => {
  const { form, handleSubmit, getStepOnNext } = useMultiStepForms(
    [
      {
        schema: z.object({
          name: zu.fieldText.required(),
          email: zu.fieldText.required(),
        }),
        defaultValues: { name: '', email: '' },
      },
      {
        schema: z.object({ city: zu.fieldText.required() }),
        defaultValues: { city: '' },
      },
      {}, // Review step — no validation
    ],
    onSubmit
  );

  return (
    <div className="flex max-w-md flex-col overflow-hidden rounded-lg border border-border">
      <Form {...form} noHtmlForm>
        <MultiStepForm>
          <MultiStepFormContent className="p-4" />

          <MultiStepFormStep label="Personal info" onNext={getStepOnNext(0)}>
            <div className="flex flex-col gap-4 px-4 pb-2">
              <FormField>
                <FormFieldLabel>Name</FormFieldLabel>
                <FormFieldController
                  type="text"
                  control={form.control}
                  name="name"
                />
              </FormField>
              <FormField>
                <FormFieldLabel>Email</FormFieldLabel>
                <FormFieldController
                  type="text"
                  control={form.control}
                  name="email"
                />
                <FormFieldError control={form.control} name="email" />
              </FormField>
            </div>
          </MultiStepFormStep>

          <MultiStepFormStep label="Address" onNext={getStepOnNext(1)}>
            <div className="flex flex-col gap-4 px-4 pb-2">
              <FormField>
                <FormFieldLabel>City</FormFieldLabel>
                <FormFieldController
                  type="text"
                  control={form.control}
                  name="city"
                />
                <FormFieldError control={form.control} name="city" />
              </FormField>
            </div>
          </MultiStepFormStep>

          <MultiStepFormStep label="Review">
            <div className="px-4 pb-2 text-sm text-muted-foreground">
              All looks good — ready to submit!
            </div>
          </MultiStepFormStep>

          <MultiStepFormNavigation
            onSubmit={handleSubmit}
            submitLabel="Submit"
            nextLabel="Next"
            backLabel="Back"
          />
        </MultiStepForm>
      </Form>
    </div>
  );
};

export const Submitting = () => {
  return (
    <div className="flex max-w-md flex-col overflow-hidden rounded-lg border border-border">
      <MultiStepForm>
        <MultiStepFormContent className="p-4" />
        <MultiStepFormStep label="Review">
          <div className="px-4 pb-2 text-sm text-muted-foreground">
            Submitting…
          </div>
        </MultiStepFormStep>
        <MultiStepFormNavigation
          onSubmit={() => {}}
          isSubmitting
          submitLabel="Submit"
          nextLabel="Next"
          backLabel="Back"
        />
      </MultiStepForm>
    </div>
  );
};

export const VisitedState = () => {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Navigate through the steps — the progress bar tracks which steps have
        been visited. Visited steps are clickable.
      </p>
      <div className="flex max-w-md flex-col overflow-hidden rounded-lg border border-border">
        <MultiStepForm>
          <MultiStepFormContent className="p-4" />
          <MultiStepFormStep label="Step 1">
            <div className="px-4 pb-2 text-sm">Step 1 content</div>
          </MultiStepFormStep>
          <MultiStepFormStep label="Step 2">
            <div className="px-4 pb-2 text-sm">Step 2 content</div>
          </MultiStepFormStep>
          <MultiStepFormStep label="Step 3">
            <div className="px-4 pb-2 text-sm">Step 3 content</div>
          </MultiStepFormStep>
          <MultiStepFormNavigation
            onSubmit={() => onSubmit({})}
            submitLabel="Submit"
            nextLabel="Next"
            backLabel="Back"
          />
        </MultiStepForm>
      </div>
    </div>
  );
};

const StepDebugInfo = () => {
  const { currentStepIndex, steps, isStepVisited } = useMultiStepForm();
  return (
    <div className="px-4 pb-2 text-xs text-muted-foreground">
      Step {currentStepIndex + 1} of {steps.length} ·{' '}
      {steps
        .map(
          (s) =>
            `${s.label}: ${isStepVisited(s.id) ? 'visited' : 'not visited'}`
        )
        .join(' · ')}
    </div>
  );
};

export const WithUseMultiStepForm = () => {
  return (
    <div className="flex max-w-md flex-col overflow-hidden rounded-lg border border-border">
      <MultiStepForm>
        <MultiStepFormContent className="p-4" />
        <StepDebugInfo />
        <MultiStepFormStep label="Step 1">
          <div className="px-4 pb-2 text-sm">Step 1 content</div>
        </MultiStepFormStep>
        <MultiStepFormStep label="Step 2">
          <div className="px-4 pb-2 text-sm">Step 2 content</div>
        </MultiStepFormStep>
        <MultiStepFormStep label="Step 3">
          <div className="px-4 pb-2 text-sm">Step 3 content</div>
        </MultiStepFormStep>
        <MultiStepFormNavigation
          onSubmit={() => onSubmit({})}
          submitLabel="Submit"
          nextLabel="Next"
          backLabel="Back"
        />
      </MultiStepForm>
    </div>
  );
};
