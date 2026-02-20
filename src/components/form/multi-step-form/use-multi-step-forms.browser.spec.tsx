import { expect, test, vi } from 'vitest';
import { z } from 'zod';

import { zu } from '@/lib/zod/zod-utils';

import {
  Form,
  FormField,
  FormFieldController,
  FormFieldLabel,
} from '@/components/form';

import { page, render, setupUser } from '@/tests/utils';

import {
  MultiStepForm,
  MultiStepFormContent,
  MultiStepFormNavigation,
  MultiStepFormStep,
  useMultiStepForms,
} from '.';

// ---------------------------------------------------------------------------
// Test fixture
// ---------------------------------------------------------------------------

const nameSchema = z.object({
  name: zu.fieldText.required('Name is required'),
});
const emailSchema = z.object({
  email: zu.fieldText.required().pipe(
    z.email({
      error: (issue) => (issue.input ? 'Invalid email' : 'Email is required'),
    })
  ),
});

type FixtureProps = {
  onSubmit?: (values: unknown) => void;
};

const Fixture = ({ onSubmit = vi.fn() }: FixtureProps) => {
  const { form, handleSubmit, getStepOnNext } = useMultiStepForms(
    [
      { schema: nameSchema, defaultValues: { name: '' } },
      { schema: emailSchema, defaultValues: { email: '' } },
      {}, // review — no validation
    ],
    onSubmit
  );

  return (
    <Form {...form} noHtmlForm>
      <MultiStepForm>
        <MultiStepFormContent />

        <MultiStepFormStep name="Name" onNext={getStepOnNext(0)}>
          <FormField>
            <FormFieldLabel>Name</FormFieldLabel>
            <FormFieldController
              type="text"
              control={form.control}
              name="name"
            />
          </FormField>
        </MultiStepFormStep>

        <MultiStepFormStep name="Email" onNext={getStepOnNext(1)}>
          <FormField>
            <FormFieldLabel>Email</FormFieldLabel>
            <FormFieldController
              type="text"
              control={form.control}
              name="email"
            />
          </FormField>
        </MultiStepFormStep>

        <MultiStepFormStep name="Review">
          <p>Ready to submit</p>
        </MultiStepFormStep>

        <MultiStepFormNavigation
          onSubmit={handleSubmit}
          submitLabel="Submit"
          nextLabel="Next"
          backLabel="Back"
        />
      </MultiStepForm>
    </Form>
  );
};

// ---------------------------------------------------------------------------
// Validation — blocking navigation
// ---------------------------------------------------------------------------

test('blocks navigation when required field is empty', async () => {
  const user = setupUser();
  render(<Fixture />);

  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect
    .element(page.getByRole('heading', { name: 'Name' }))
    .toBeVisible();
});

test('shows validation error when clicking Next with empty field', async () => {
  const user = setupUser();
  render(<Fixture />);

  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect.element(page.getByText('Name is required')).toBeVisible();
});

test('shows validation error for invalid email', async () => {
  const user = setupUser();
  render(<Fixture />);

  const nameInput = page
    .getByRole('textbox', { name: 'Name' })
    .element() as HTMLInputElement;
  await user.type(nameInput, 'Alice');
  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect
    .element(page.getByRole('heading', { name: 'Email' }))
    .toBeVisible();
  const emailInput = page
    .getByRole('textbox', { name: 'Email' })
    .element() as HTMLInputElement;
  await user.type(emailInput, 'not-an-email');
  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect.element(page.getByText('Invalid email')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Validation — allowing navigation
// ---------------------------------------------------------------------------

test('allows navigation when required field is filled', async () => {
  const user = setupUser();
  render(<Fixture />);

  const input = page
    .getByRole('textbox', { name: 'Name' })
    .element() as HTMLInputElement;
  await user.type(input, 'Alice');
  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect
    .element(page.getByRole('heading', { name: 'Email' }))
    .toBeVisible();
});

test('allows navigation on step without a schema', async () => {
  const user = setupUser();
  render(<Fixture />);

  const nameInput = page
    .getByRole('textbox', { name: 'Name' })
    .element() as HTMLInputElement;
  await user.type(nameInput, 'Alice');
  await user.click(page.getByRole('button', { name: 'Next' }));

  const emailInput = page
    .getByRole('textbox', { name: 'Email' })
    .element() as HTMLInputElement;
  await user.type(emailInput, 'alice@example.com');
  await user.click(page.getByRole('button', { name: 'Next' }));

  // Review step has no schema, so no validation — submit button should appear
  await expect
    .element(page.getByRole('button', { name: 'Submit' }))
    .toBeVisible();
});

// ---------------------------------------------------------------------------
// Error lifecycle
// ---------------------------------------------------------------------------

test('validation error clears once the field is corrected', async () => {
  const user = setupUser();
  render(<Fixture />);

  // Trigger error
  await user.click(page.getByRole('button', { name: 'Next' }));
  await expect.element(page.getByText('Name is required')).toBeVisible();

  // Fix the field — blur triggers revalidation (mode: onBlur)
  const input = page
    .getByRole('textbox', { name: 'Name' })
    .element() as HTMLInputElement;
  await user.type(input, 'Alice');
  await user.tab(); // blur

  await expect
    .element(page.getByText('Name is required'))
    .not.toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

test('submit receives merged values from all steps', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  render(<Fixture onSubmit={mockedSubmit} />);

  const nameInput = page
    .getByRole('textbox', { name: 'Name' })
    .element() as HTMLInputElement;
  await user.type(nameInput, 'Alice');
  await user.click(page.getByRole('button', { name: 'Next' }));

  const emailInput = page
    .getByRole('textbox', { name: 'Email' })
    .element() as HTMLInputElement;
  await user.type(emailInput, 'alice@example.com');
  await user.click(page.getByRole('button', { name: 'Next' }));

  await user.click(page.getByRole('button', { name: 'Submit' }));

  expect(mockedSubmit).toHaveBeenCalledWith({
    name: 'Alice',
    email: 'alice@example.com',
  });
});

test('submit is not called when validation fails on a step', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();

  // Render a single-step form that goes straight to submit
  const SingleStepFixture = () => {
    const { form, handleSubmit, getStepOnNext } = useMultiStepForms(
      [{ schema: nameSchema, defaultValues: { name: '' } }],
      mockedSubmit
    );

    return (
      <Form {...form} noHtmlForm>
        <MultiStepForm>
          <MultiStepFormContent />
          <MultiStepFormStep name="Name" onNext={getStepOnNext(0)}>
            <FormField>
              <FormFieldLabel>Name</FormFieldLabel>
              <FormFieldController
                type="text"
                control={form.control}
                name="name"
              />
            </FormField>
          </MultiStepFormStep>
          <MultiStepFormNavigation
            onSubmit={handleSubmit}
            submitLabel="Submit"
            nextLabel="Next"
            backLabel="Back"
          />
        </MultiStepForm>
      </Form>
    );
  };

  render(<SingleStepFixture />);

  // Last step — submit button is visible. Clicking it with empty field should not call onSubmit.
  await user.click(page.getByRole('button', { name: 'Submit' }));

  expect(mockedSubmit).not.toHaveBeenCalled();
});
