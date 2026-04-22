import { OTPFieldPreview as OTPField } from '@base-ui/react/otp-field';
import { cva, VariantProps } from 'class-variance-authority';
import { MinusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/tailwind/utils';

const InputOTPContext = React.createContext<
  (VariantProps<typeof inputOTPSlotVariants> & { invalid: boolean }) | null
>(null);

const inputOTPSlotVariants = cva(
  cn(
    'border-y border-e border-input text-base shadow-xs transition-all outline-none',
    'first:rounded-s-md first:border-s last:rounded-e-md',
    'text-center text-base!', // text-base! prevents zoom on iOS
    'aria-invalid:border-destructive',
    'focus:z-10 focus:border-ring focus:ring-[3px] focus:ring-ring/50',
    'focus:aria-invalid:border-destructive focus:aria-invalid:ring-destructive/20',
    'dark:focus:aria-invalid:ring-destructive/40',
    'disabled:cursor-not-allowed'
  ),
  {
    variants: {
      size: {
        default: 'h-9 w-10',
        sm: 'size-8',
        lg: 'h-10 w-11 md:text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const useInputOTPContext = () => {
  const ctx = React.use(InputOTPContext);
  if (!ctx) {
    throw new Error('Missing <InputOTP /> parent component');
  }
  return ctx;
};

function InputOTP({
  className,
  size,
  children,
  ...props
}: React.ComponentProps<typeof OTPField.Root> &
  VariantProps<typeof inputOTPSlotVariants>) {
  const invalid = !!props['aria-invalid'];
  const value = React.useMemo(() => ({ size, invalid }), [size, invalid]);

  return (
    <InputOTPContext value={value}>
      <OTPField.Root
        data-slot="input-otp"
        className={cn(
          'flex w-fit items-center gap-2 has-disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </OTPField.Root>
    </InputOTPContext>
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn('flex items-center', className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  className,
  ...props
}: React.ComponentProps<typeof OTPField.Input>) {
  const ctx = useInputOTPContext();

  return (
    <OTPField.Input
      data-slot="input-otp-slot"
      className={cn(inputOTPSlotVariants({ size: ctx.size }), className)}
      aria-invalid={ctx.invalid ? true : undefined}
      {...props}
    />
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
