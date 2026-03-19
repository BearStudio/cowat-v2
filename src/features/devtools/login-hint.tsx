import { TerminalIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { AUTH_EMAIL_OTP_MOCKED } from '@/features/auth/config';

const LoginEmailButton = ({ email }: { email: string }) => {
  const form = useFormContext();
  return (
    <button
      type="button"
      className="cursor-pointer font-medium text-neutral-900 underline underline-offset-4 hover:no-underline dark:text-white"
      onClick={() =>
        form.setValue('email', email, {
          shouldValidate: true,
        })
      }
    >
      {email}
    </button>
  );
};

export const LoginEmailHint = () => {
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Alert dir="ltr">
      <TerminalIcon className="size-4" />
      <AlertTitle>Dev mode</AlertTitle>
      <AlertDescription className="flex flex-wrap gap-x-1 text-sm leading-4">
        You can login with <LoginEmailButton email="admin@admin.com" />
        {' or '}
        <LoginEmailButton email="user@user.com" />
      </AlertDescription>
    </Alert>
  );
};

export const LoginEmailOtpHint = () => {
  const form = useFormContext();

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <Alert dir="ltr">
      <TerminalIcon className="size-4" />
      <AlertTitle>Dev mode</AlertTitle>
      <AlertDescription className="flex text-sm leading-4">
        Use the code{' '}
        <button
          type="button"
          className="cursor-pointer font-medium text-neutral-900 underline underline-offset-4 hover:no-underline dark:text-white"
          onClick={() =>
            form.setValue('otp', AUTH_EMAIL_OTP_MOCKED, {
              shouldValidate: true,
            })
          }
        >
          {AUTH_EMAIL_OTP_MOCKED}
        </button>
      </AlertDescription>
    </Alert>
  );
};
