import type { Meta } from '@storybook/react-vite';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default {
  title: 'Label',
} satisfies Meta;

export const Default = () => {
  return <Label>Email address</Label>;
};

export const WithInput = () => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="email">Email address</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  );
};

export const Required = () => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="name">
        Full name
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      </Label>
      <Input id="name" placeholder="Alice Martin" />
    </div>
  );
};

export const Disabled = () => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="disabled-input">Disabled field</Label>
      <Input id="disabled-input" disabled value="Locked value" />
    </div>
  );
};
