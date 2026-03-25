import type { Meta } from '@storybook/react-vite';

import { ThemeSwitcher } from '@/components/ui/theme-switcher';

export default {
  title: 'UI/Theme Switcher',
} satisfies Meta<typeof ThemeSwitcher>;

export const Default = () => {
  return <ThemeSwitcher />;
};

export const IconOnly = () => {
  return <ThemeSwitcher iconOnly />;
};
