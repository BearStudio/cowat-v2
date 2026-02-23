import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { InputGroupButton } from '@/components/ui/input-group';

type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'type' | 'endAddon'
>;

export function PasswordInput({ ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      endAddon={
        <InputGroupButton
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide' : 'Show'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      }
    />
  );
}
