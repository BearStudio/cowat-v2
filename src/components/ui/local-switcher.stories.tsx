import type { Meta } from '@storybook/react-vite';

import { LocalSwitcher } from '@/components/ui/local-switcher';

export default {
  title: 'UI/Local Switcher',
} satisfies Meta<typeof LocalSwitcher>;

export const Default = () => {
  return <LocalSwitcher />;
};

export const IconOnly = () => {
  return <LocalSwitcher iconOnly />;
};
