import type { Meta } from '@storybook/react-vite';

import { onSubmit } from '@/components/form/docs.utils';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

export default {
  title: 'UI/InputOTP',
} satisfies Meta<typeof InputOTP>;

export const Default = () => {
  return (
    <InputOTP length={6} onValueComplete={onSubmit}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  );
};

export const Invalid = () => {
  return (
    <InputOTP aria-invalid length={6} onValueComplete={onSubmit}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  );
};

export const Disabled = () => {
  return (
    <InputOTP disabled length={6} onValueComplete={onSubmit}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  );
};

export const Sizes = () => {
  return (
    <div className="flex flex-col gap-4">
      <InputOTP size="sm" length={6} onValueComplete={onSubmit}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>
      <InputOTP length={6} onValueComplete={onSubmit}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>
      <InputOTP size="lg" length={6} onValueComplete={onSubmit}>
        <InputOTPGroup>
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
          <InputOTPSlot />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
};
