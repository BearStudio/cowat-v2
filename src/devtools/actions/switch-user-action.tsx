import { useMutation } from '@tanstack/react-query';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { authClient } from '@/features/auth/client';
import { AUTH_EMAIL_OTP_MOCKED } from '@/features/auth/config';

function useSignInAs() {
  const router = useRouter();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (email: string) => {
      const sendResult = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in',
      });
      if (sendResult.error) throw sendResult.error;

      const signInResult = await authClient.signIn.emailOtp({
        email,
        otp: AUTH_EMAIL_OTP_MOCKED,
      });
      if (signInResult.error) throw signInResult.error;
    },
    onSuccess: (_, email) => {
      toast.success(`Signed in as ${email}`);
      router.invalidate();
      navigate({ to: '/app' });
    },
    onError: (_, email) => toast.error(`Failed to sign in as ${email}`),
  });
}

export function SwitchUserAction() {
  const signInAs = useSignInAs();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Switch User</CardTitle>
        <CardDescription>Sign in as a seed user (dev OTP)</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          loading={signInAs.isPending && signInAs.variables === 'user@user.com'}
          disabled={signInAs.isPending}
          onClick={() => signInAs.mutate('user@user.com')}
        >
          User
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={
            signInAs.isPending && signInAs.variables === 'admin@admin.com'
          }
          disabled={signInAs.isPending}
          onClick={() => signInAs.mutate('admin@admin.com')}
        >
          Admin
        </Button>
      </CardContent>
    </Card>
  );
}
