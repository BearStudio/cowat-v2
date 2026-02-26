import type { Meta } from '@storybook/react-vite';

import { PasswordInput } from '@/components/ui/password-input';

export default {
  title: 'PasswordInput',
} satisfies Meta;

export const Default = () => {
  return <PasswordInput placeholder="Enter your password" />;
};

export const WithValue = () => {
  return <PasswordInput defaultValue="super-secret-password" />;
};

export const Disabled = () => {
  return <PasswordInput disabled defaultValue="super-secret-password" />;
};

export const ReadOnly = () => {
  return <PasswordInput readOnly defaultValue="super-secret-password" />;
};
