import { expect, test, vi } from 'vitest';

import { page, render, setupUser } from '@/tests/utils';

import {
  MultiStepForm,
  MultiStepFormContent,
  MultiStepFormNavigation,
  MultiStepFormStep,
} from '.';

const renderForm = ({
  onSubmit = vi.fn(),
  step1OnNext,
}: {
  onSubmit?: () => void;
  step1OnNext?: () => Promise<boolean> | boolean;
} = {}) => {
  render(
    <MultiStepForm>
      <MultiStepFormContent />
      <MultiStepFormStep label="Step one" onNext={step1OnNext}>
        <p>Content one</p>
      </MultiStepFormStep>
      <MultiStepFormStep label="Step two">
        <p>Content two</p>
      </MultiStepFormStep>
      <MultiStepFormStep label="Step three">
        <p>Content three</p>
      </MultiStepFormStep>
      <MultiStepFormNavigation
        onSubmit={onSubmit}
        submitLabel="Submit"
        nextLabel="Next"
        backLabel="Back"
      />
    </MultiStepForm>
  );
};

test('renders first step on mount', async () => {
  renderForm();

  await expect.element(page.getByText('Step one')).toBeVisible();
  await expect.element(page.getByText('Content one')).toBeVisible();
  await expect
    .element(page.getByRole('button', { name: 'Next' }))
    .toBeVisible();
  expect(page.getByRole('button', { name: 'Back' }).query()).toBeNull();
});

test('next button advances to the next step', async () => {
  const user = setupUser();
  renderForm();

  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect.element(page.getByText('Step two')).toBeVisible();
  await expect.element(page.getByText('Content two')).toBeVisible();
  await expect.element(page.getByText('Content one')).not.toBeVisible();
});

test('back button returns to the previous step', async () => {
  const user = setupUser();
  renderForm();

  await user.click(page.getByRole('button', { name: 'Next' }));
  await expect.element(page.getByText('Step two')).toBeVisible();

  await user.click(page.getByRole('button', { name: 'Back' }));
  await expect.element(page.getByText('Step one')).toBeVisible();
  await expect.element(page.getByText('Content one')).toBeVisible();
});

test('back button is hidden on first step', async () => {
  renderForm();
  expect(page.getByRole('button', { name: 'Back' }).query()).toBeNull();
});

test('submit button appears on last step', async () => {
  const user = setupUser();
  renderForm();

  await user.click(page.getByRole('button', { name: 'Next' }));
  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect.element(page.getByText('Step three')).toBeVisible();
  await expect
    .element(page.getByRole('button', { name: 'Submit' }))
    .toBeVisible();
  expect(page.getByRole('button', { name: 'Next' }).query()).toBeNull();
});

test('submit callback is called when clicking submit on last step', async () => {
  const user = setupUser();
  const mockedSubmit = vi.fn();
  renderForm({ onSubmit: mockedSubmit });

  await user.click(page.getByRole('button', { name: 'Next' }));
  await user.click(page.getByRole('button', { name: 'Next' }));
  await user.click(page.getByRole('button', { name: 'Submit' }));

  expect(mockedSubmit).toHaveBeenCalledOnce();
});

test('onNext returning false blocks navigation', async () => {
  const user = setupUser();
  renderForm({ step1OnNext: () => false });

  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect.element(page.getByText('Step one')).toBeVisible();
  await expect.element(page.getByText('Content one')).toBeVisible();
});

test('onNext returning a rejected promise blocks navigation', async () => {
  const user = setupUser();
  renderForm({ step1OnNext: () => Promise.resolve(false) });

  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect.element(page.getByText('Step one')).toBeVisible();
});

test('onNext returning true allows navigation', async () => {
  const user = setupUser();
  renderForm({ step1OnNext: () => true });

  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect.element(page.getByText('Step two')).toBeVisible();
});

test('step without onNext always allows navigation', async () => {
  const user = setupUser();
  renderForm();

  await user.click(page.getByRole('button', { name: 'Next' }));
  await expect.element(page.getByText('Step two')).toBeVisible();

  await user.click(page.getByRole('button', { name: 'Next' }));
  await expect.element(page.getByText('Step three')).toBeVisible();
});

test('first step is marked as visited on mount', async () => {
  renderForm();

  const firstBar = page.getByRole('button', { name: 'Step one' });
  // First step is current, so it should be aria-current and disabled
  await expect.element(firstBar).toHaveAttribute('aria-current', 'step');
  await expect.element(firstBar).toBeDisabled();
});

test('current step progress bar has aria-current="step"', async () => {
  const user = setupUser();
  renderForm();

  await user.click(page.getByRole('button', { name: 'Next' }));

  await expect
    .element(page.getByRole('button', { name: 'Step two' }))
    .toHaveAttribute('aria-current', 'step');
  await expect
    .element(page.getByRole('button', { name: 'Step one' }))
    .not.toHaveAttribute('aria-current');
});

test('visited progress steps are clickable and navigate back', async () => {
  const user = setupUser();
  renderForm();

  await user.click(page.getByRole('button', { name: 'Next' }));
  await expect.element(page.getByText('Step two')).toBeVisible();

  await user.click(page.getByRole('button', { name: 'Step one' }));
  await expect.element(page.getByText('Step one')).toBeVisible();
  await expect.element(page.getByText('Content one')).toBeVisible();
});

test('unvisited progress steps are disabled', async () => {
  renderForm();

  await expect
    .element(page.getByRole('button', { name: 'Step two' }))
    .toBeDisabled();
  await expect
    .element(page.getByRole('button', { name: 'Step three' }))
    .toBeDisabled();
});

test('navigating forward marks steps as visited', async () => {
  const user = setupUser();
  renderForm();

  await user.click(page.getByRole('button', { name: 'Next' }));

  // Step one is now visited and enabled (not current), step two is current
  const stepOneBar = page.getByRole('button', { name: 'Step one' });
  await expect.element(stepOneBar).not.toBeDisabled();
  await expect.element(stepOneBar).not.toHaveAttribute('aria-current');
});
